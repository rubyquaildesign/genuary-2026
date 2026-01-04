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

struct Uniforms {
  bleed: f32,
  red: f32,
}

struct VertexSource {
  @location(0) position: vec2f,
  @location(1) colorAmounts: vec3f,
  @location(2) vertexIndices: vec3u
}

struct VertexOut {
  @builtin(position) pos: vec4f,
  @location(0) @interpolate(perspective) ratios: vec3f,
  @location(1) @interpolate(flat) vertexIndices: vec3u
}

@group(0) @binding(0) var<storage> colours: array<vec3f>;
@vertex
fn vs_main(vx_in:VertexSource) -> VertexOut {
  var vsOut: VertexOut;
  vsOut.pos = vec4f(vx_in.position,1.0,1.0);
  vsOut.ratios = vx_in.colorAmounts;
  vsOut.vertexIndices = vx_in.vertexIndices;
  return vsOut;
  
}
fn interp(av:f32,ac: vec3f, bv:f32,bc:vec3f,cv:f32,cc:vec3f) -> vec3f {
  let abTotal = av + bv;
    if (abTotal < 0.00001) {
    return cc;
  }
  let abColor = mixSpectral(ac,bc,(bv / abTotal));
  let avg = (av + bv) / 2;
  let fullTotal = (avg * 2) + cv;
  return mixSpectral(abColor,cc,(cv/fullTotal));
}
@fragment
fn fs_main(input:VertexOut) -> @location(0) vec4f {
  let r = cubic3(input.ratios);
  let aColor = rgb2oklab(colours[input.vertexIndices.x]);
  let bColor = rgb2oklab(colours[input.vertexIndices.y]);
  let cColor = rgb2oklab(colours[input.vertexIndices.z]);
  var finalColor = interp(r.x,aColor,r.y,bColor,r.z,cColor);
  finalColor = (r.x * aColor) + (r.y * bColor) + (r.z * cColor);
  finalColor = finalColor / (r.x + r.y + r.z);
  return vec4(oklab2srgb(finalColor),1.0);
}