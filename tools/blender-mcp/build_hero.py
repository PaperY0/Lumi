# Runs inside Blender via tools/blender-mcp/bl.py exec.
# Builds the Lumi hero asset: a faceted "heart-gem" core wrapped by two ribbons and a halo ring,
# then exports GLB to frontend/public/models/lumi-hero.glb
import bpy, bmesh, math
from mathutils import Vector

OUT = r"D:\Project\Lumi\frontend\public\models\lumi-hero.glb"

# ── reset scene ──────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.curves):
    for b in list(coll):
        if b.users == 0:
            coll.remove(b)

def mat(name, base, rough=0.15, metal=0.0, transmission=0.0, ior=1.45, emission=None, emission_strength=0.0, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*base, 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    bsdf.inputs["IOR"].default_value = ior
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = transmission
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = coat
        bsdf.inputs["Coat Roughness"].default_value = 0.08
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return m

# Palette pulled from Lumi's design tokens
ROSE   = (0.78, 0.20, 0.36)
PLUM   = (0.35, 0.14, 0.30)
GOLD   = (0.82, 0.57, 0.31)
LILAC  = (0.48, 0.29, 0.60)
PEARL  = (1.0, 0.90, 0.84)

# Saturated, mostly opaque materials survive the pale page background. The
# former fully transmissive heart inherited too much white from the scene and
# disappeared at normal viewing sizes.
m_gem    = mat("LumiGem",    ROSE,  rough=0.13, metal=0.04, transmission=0.16, ior=1.48, coat=0.72)
m_ribbon = mat("LumiRibbon", PLUM,  rough=0.20, metal=0.34, coat=0.45)
m_ribbon2= mat("LumiRibbon2",LILAC, rough=0.22, metal=0.28, coat=0.42)
m_ring   = mat("LumiRing",   GOLD,  rough=0.16, metal=0.92, coat=0.35)
m_pearl  = mat("LumiPearl",  PEARL, rough=0.10, metal=0.05, emission=(1.0, 0.54, 0.62), emission_strength=0.32, coat=0.6)
m_node   = mat("LumiNode",   GOLD,  rough=0.12, metal=0.85, emission=(1.0, 0.48, 0.22), emission_strength=0.18, coat=0.5)

# ── 1. Heart gem core: build a heart profile, extrude with taper, bevel & facet ─
def heart_curve(t):
    # classic heart param, scaled to ~1 unit
    x = 16 * math.sin(t) ** 3
    y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
    return Vector((x / 17.0, y / 17.0, 0.0))

bm = bmesh.new()
N = 48
front = [bm.verts.new(heart_curve(2 * math.pi * i / N) + Vector((0, 0, 0.22))) for i in range(N)]
back  = [bm.verts.new(heart_curve(2 * math.pi * i / N) + Vector((0, 0, -0.22))) for i in range(N)]
bm.faces.new(front)
bm.faces.new(reversed(back))
for i in range(N):
    bm.faces.new((front[i], front[(i + 1) % N], back[(i + 1) % N], back[i]))
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
me = bpy.data.meshes.new("HeartGemMesh")
bm.to_mesh(me); bm.free()
gem = bpy.data.objects.new("HeartGem", me)
bpy.context.collection.objects.link(gem)
gem.data.materials.append(m_gem)
# Puffy porcelain/glass heart: heavy bevel + subdivision instead of hard facets
bpy.context.view_layer.objects.active = gem
gem.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode='OBJECT')
gem.select_set(False)
bev = gem.modifiers.new("Bevel", 'BEVEL'); bev.width = 0.19; bev.segments = 8; bev.limit_method = 'ANGLE'; bev.angle_limit = math.radians(40)
sub = gem.modifiers.new("Subd", 'SUBSURF'); sub.levels = 1; sub.render_levels = 1
gem.rotation_euler = (math.radians(90), 0, 0)
gem.scale = (0.82, 0.82, 0.82)
gem.location = (0, 0, 0.05)

# ── 2. Two ribbons: torus knots-ish sweeps via bezier curves with bevel ───────
def ribbon(name, material, radius=1.45, twist=1.0, phase=0.0, tilt=0.55, thickness=0.035, width=0.16, segs=160):
    cu = bpy.data.curves.new(name + "Curve", 'CURVE'); cu.dimensions = '3D'
    sp = cu.splines.new('NURBS'); sp.points.add(segs - 1); sp.use_cyclic_u = True; sp.order_u = 4
    for i in range(segs):
        t = 2 * math.pi * i / segs
        x = radius * math.cos(t + phase)
        y = radius * math.sin(t + phase) * math.cos(tilt)
        z = radius * math.sin(t + phase) * math.sin(tilt) + 0.18 * math.sin(3 * t * twist + phase)
        sp.points[i].co = (x, y, z, 1.0)
    cu.bevel_mode = 'OBJECT'
    # flat ribbon profile
    prof = bpy.data.curves.new(name + "Profile", 'CURVE'); prof.dimensions = '2D'
    ps = prof.splines.new('POLY'); ps.points.add(3); ps.use_cyclic_u = True
    hw, ht = width / 2, thickness / 2
    for p, (px, py) in zip(ps.points, [(-hw, -ht), (hw, -ht), (hw, ht), (-hw, ht)]):
        p.co = (px, py, 0, 1)
    prof_obj = bpy.data.objects.new(name + "ProfileObj", prof); bpy.context.collection.objects.link(prof_obj)
    prof_obj.hide_render = True; prof_obj.hide_viewport = True
    cu.bevel_object = prof_obj
    cu.use_fill_caps = True
    cu.twist_mode = 'MINIMUM'
    cu.twist_smooth = 2.0
    ob = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(ob)
    ob.data.materials.append(material)
    return ob, prof_obj

r1, p1 = ribbon("RibbonPlum",  m_ribbon,  radius=1.45, tilt=0.62, phase=0.0, width=0.12, thickness=0.05)
r2, p2 = ribbon("RibbonLilac", m_ribbon2, radius=1.62, tilt=-0.48, phase=1.1, width=0.09, thickness=0.045)

# ── 3. Thin gold halo ring ────────────────────────────────────────────────────
bpy.ops.mesh.primitive_torus_add(major_radius=1.95, minor_radius=0.022, major_segments=128, minor_segments=16)
ring = bpy.context.active_object; ring.name = "HaloRing"
ring.data.materials.append(m_ring)
ring.rotation_euler = (math.radians(78), 0, math.radians(20))

# ── 4. Floating pearls (small emissive spheres) ───────────────────────────────
pearls = []
for i, (px, py, pz, s) in enumerate([(1.55, 0.9, 0.7, 0.09), (-1.4, -0.6, 1.1, 0.065), (0.9, -1.5, -0.8, 0.06), (-1.7, 0.7, -0.5, 0.075), (0.2, 1.7, -1.1, 0.055)]):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=s, segments=24, ring_count=16, location=(px, py, pz))
    o = bpy.context.active_object; o.name = f"Pearl{i}"; o.data.materials.append(m_pearl); pearls.append(o)

# A necklace of small gold nodes gives the outer orbit a crafted, jewellery-like
# rhythm instead of reading as one generic wireframe loop.
nodes = []
for i in range(8):
    t = 2 * math.pi * i / 8 + 0.18
    px = 1.95 * math.cos(t)
    py = 1.95 * math.sin(t) * math.cos(math.radians(78))
    pz = 1.95 * math.sin(t) * math.sin(math.radians(78))
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.045 if i % 2 else 0.065, location=(px, py, pz))
    o = bpy.context.active_object; o.name = f"GoldNode{i}"; o.data.materials.append(m_node); nodes.append(o)

# smooth shading everywhere
for ob in [gem, ring, *pearls, *nodes]:
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.shade_smooth()
    ob.select_set(False)

# convert ribbons to mesh so glTF exporter gets clean geometry
for ob in (r1, r2):
    bpy.context.view_layer.objects.active = ob; ob.select_set(True)
    bpy.ops.object.convert(target='MESH'); bpy.ops.object.shade_smooth(); ob.select_set(False)
for p in (p1, p2):
    bpy.data.objects.remove(p, do_unlink=True)

# ── 5. Group under an empty and export ───────────────────────────────────────
root = bpy.data.objects.new("LumiHero", None); bpy.context.collection.objects.link(root)
for ob in [gem, r1, r2, ring, *pearls, *nodes]:
    ob.parent = root

import os
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.object.select_all(action='DESELECT')
root.select_set(True)
for ob in root.children: ob.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=OUT, export_format='GLB', use_selection=True,
    export_apply=True, export_yup=True, export_materials='EXPORT',
    export_draco_mesh_compression_enable=False,
)
print("EXPORTED", OUT, os.path.getsize(OUT))
