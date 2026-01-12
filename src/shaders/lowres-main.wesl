struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) texcoord: vec2f,
};

@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32,
) -> VSOutput {
  var pos = array(
    vec2f(-1.0, -1.0),
    vec2f(-1.0,  3.0),
    vec2f( 3.0, -1.0),
  );

  var vsOutput: VSOutput;
  let xy = pos[vertexIndex];
  vsOutput.position = vec4f(xy, 0.0, 1.0);
  vsOutput.texcoord = xy * vec2f(0.5, -0.5) + vec2f(0.5);
  return vsOutput;
}
struct Uniforms {
  pixelSize: u32,
}
@group(0) @binding(3) var<uniform> uni: Uniforms; 
@group(0) @binding(0) var postTexture2d: texture_2d<f32>;
@group(0) @binding(1) var postSampler: sampler;
@group(0) @binding(2) var texArr: texture_2d<f32>; 
@fragment fn fs2d(fsInput: VSOutput) -> @location(0) vec4f {
  let res = textureDimensions(postTexture2d);
  let xCoord = fsInput.texcoord.x * f32(res.x);
  let yCoord = fsInput.texcoord.y * f32(res.y);
  let circCoord = vec2(fract(xCoord),fract(yCoord)) / 4.0;
  let color = textureLoad(postTexture2d,vec2u(u32(floor(xCoord)),u32(floor(yCoord))),0);
  let avg = (color.r + color.g + color.b) / 3.0;
  let layer = floor(avg * 16.0);
  let lx = fract(layer / 4) * 4;
  let ly = floor(layer / 4);
  let amt = 1.0 / 4;
  let circCol = textureSample(texArr,postSampler,vec2f(amt * lx + circCoord.x,amt * ly + circCoord.y));
  
  return vec4f(vec3(circCol.rgb * color.rgb),1.0);
}