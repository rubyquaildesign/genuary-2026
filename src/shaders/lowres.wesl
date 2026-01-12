import lygia::color::mixSpectral::mixSpectral;
import lygia::color::space::rgb2srgb::rgb2srgb;
import lygia::color::space::rgb2oklab::rgb2oklab;
import lygia::color::space::oklab2srgb::oklab2srgb;
import lygia::math::cubic::{cubic3};
@if(typecheck)
const PI:f32 = 2;
@if(typecheck)
fn mixSpectral(a:vec3f,b:vec3f,c:f32) -> vec3f {}
@if(typecheck)
fn rgb2srgb(a:vec3f) -> vec3f {}
@if(typecheck)
fn textureSampleBaseClampToEdge(t: texture_external,
s: sampler,
coords: vec2<f32>) -> vec4<f32> {}

struct OurVertexShaderOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

struct Uniforms {
  resolution: vec2<u32>,
};

@group(0) @binding(2) var<uniform> uni: Uniforms;
@group(0) @binding(0) var ourSampler: sampler;
@group(0) @binding(1) var ourTexture: texture_external;
@group(0) @binding(3) var tex: texture_storage_2d<rgba8unorm, write>;


@compute @workgroup_size(8, 8) fn comp_shader(
  @builtin(global_invocation_id) id:vec3u
) {
  let size = textureDimensions(tex);
  let sourceDims = textureDimensions(ourTexture);
  let sourceAspect = f32(sourceDims.x )/ f32(sourceDims.y);
  let destAspect = f32(size.x) / f32(size.y);
  let center = vec2f(size) / 2.0;
  let pos = id.xy;
  if (id.x > size.x){ return;}
  if (id.y > size.y) {return;}
  let uv = vec2f(pos) / vec2f(size);
  let cam = textureSampleBaseClampToEdge(ourTexture, ourSampler,uv);
  textureStore(tex,pos,cam);

}