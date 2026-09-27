"""Create a separate robot scene using Blender --background --python.
Existing scenes are retained. Render the saved robot scene with Blender CLI -a.
"""
import bpy
import math
import tempfile
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
scene = bpy.data.scenes.new('Cliniq Robot Studio')
bpy.context.window.scene = scene

def material(name, color, metallic=0.0, roughness=0.3, glow=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Emission Color'].default_value = (*color, 1)
    shader.inputs['Emission Strength'].default_value = glow
    return mat

shell = material('Porcelain | pearl', (0.78, 0.93, 0.9), 0.22)
teal = material('Cliniq | teal enamel', (0.015, 0.43, 0.36), 0.35)
dark = material('Visor | midnight glass', (0.008, 0.028, 0.04), 0.35, 0.21)
metal = material('Joints | brushed titanium', (0.12, 0.21, 0.23), 0.75)
light = material('LED | mint', (0.12, 1.0, 0.72), 0.1, 0.25, 2.0)

def pivot(name, location, parent=None):
    obj = bpy.data.objects.new(name, None)
    scene.collection.objects.link(obj)
    obj.parent = parent
    obj.location = location
    return obj

root = pivot('Robot | hover', (0, 0, 0))
head = pivot('Head | look around', (0, 0, 2.55), root)

def rounded(name, location, dimensions, mat, bevel=0.15, parent=root):
    bpy.ops.mesh.primitive_cube_add()
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mod = obj.modifiers.new('Machined soft edges', 'BEVEL')
    mod.width = bevel
    mod.segments = 5
    obj.modifiers.new('Weighted surface normals', 'WEIGHTED_NORMAL')
    obj.data.materials.append(mat)
    obj.parent = parent
    obj.location = location
    return obj

def sphere(name, location, scale, mat, parent=root):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    for face in obj.data.polygons:
        face.use_smooth = True
    obj.parent = parent
    obj.location = location
    return obj

rounded('Head | ceramic housing', (0, 0, 0), (1.85, 1.03, 1.24), shell, .32, head)
rounded('Visor | teal gasket', (0, -.47, -.02), (1.64, .22, .99), teal, .26, head)
rounded('Visor | curved dark display', (0, -.60, -.02), (1.46, .16, .81), dark, .23, head)
eyes = [rounded('Eye | '+side, (x, -.701, .05), (.16, .055, .29), light, .077, head) for side, x in [('L', -.34), ('R', .34)]]
# A continuous smile, with depth, rather than a flat decal.
curve = bpy.data.curves.new('Smile curve', 'CURVE')
curve.dimensions = '3D'
curve.bevel_depth = .025
curve.bevel_resolution = 4
spline = curve.splines.new('POLY')
spline.points.add(16)
for i, p in enumerate(spline.points):
    x = -.18 + i * .0225
    p.co = (x, -.705, -.23 + 2.0 * x*x, 1)
smile = bpy.data.objects.new('Display | smile', curve)
scene.collection.objects.link(smile)
smile.parent = head
curve.materials.append(light)
for x in [-.99, .99]:
    sphere('Ear | swivel', (x, 0, 0), (.15, .32, .32), teal, head)
    sphere('Ear | LED', (x*1.1, -.04, 0), (.055, .17, .17), light, head)
rounded('Antenna | stem', (0, .08, .76), (.08, .08, .30), metal, .035, head)
sphere('Antenna | beacon', (0, .08, .96), (.12, .12, .12), light, head)
sphere('Neck | gimbal', (0, 0, 1.83), (.25, .25, .25), metal)
rounded('Torso | teal core', (0, 0, 1.25), (1.20, .78, 1.03), teal, .27)
rounded('Chest | ceramic plate', (0, -.35, 1.30), (.94, .19, .79), shell, .23)
rounded('Chest | status display', (0, -.465, 1.35), (.52, .07, .33), dark, .1)
rounded('Pulse | horizontal', (0, -.51, 1.35), (.24, .028, .065), light, .028)
rounded('Pulse | vertical', (0, -.51, 1.35), (.065, .028, .23), light, .028)
for x in [-.17, 0, .17]:
    rounded('Chest | ventilation', (x, -.46, 1.02), (.09, .03, .028), metal, .012)
arms = []
for side, sign in [('L', -1), ('R', 1)]:
    arm = pivot('Arm | '+side, (sign*.76, 0, 1.56), root)
    arms.append(arm)
    sphere('Shoulder | '+side, (0, 0, 0), (.20, .22, .20), metal, arm)
    rounded('Arm shell | '+side, (sign*.06, 0, -.30), (.29, .34, .47), shell, .13, arm)
    sphere('Wrist | '+side, (sign*.06, 0, -.56), (.12, .14, .12), metal, arm)
    rounded('Hand | '+side, (sign*.06, -.02, -.73), (.29, .30, .26), teal, .10, arm)
    for finger in [-.065, .065]:
        rounded('Finger seam | '+side, (sign*.06+finger, -.176, -.74), (.018, .018, .12), dark, .007, arm)
    sphere('Hip | '+side, (sign*.32, 0, .67), (.15, .17, .16), metal)
    rounded('Boot | '+side, (sign*.34, -.06, .42), (.43, .58, .43), shell, .16)
    rounded('Boot sole | '+side, (sign*.34, -.07, .25), (.43, .57, .10), teal, .04)

scene.frame_start = 1
scene.frame_end = 48
scene.render.fps = 12
for frame in range(1, 50):
    phase = (frame-1)/48 * math.tau
    root.location.z = .06*math.sin(phase)
    root.rotation_euler.z = .08*math.sin(phase)
    head.rotation_euler.z = .13*math.sin(phase + .4)
    head.rotation_euler.y = .05*math.sin(phase)
    arms[0].rotation_euler.y = -.12 - .08*math.sin(phase)
    arms[1].rotation_euler.y = -2.20 + .25*math.sin(phase*2)
    blink = .12 if frame in (22, 23) else 1.0
    for eye in eyes:
        eye.scale.z = blink
        eye.keyframe_insert(data_path='scale', frame=frame)
    for obj in [root, head, *arms]:
        obj.keyframe_insert(data_path='rotation_euler', frame=frame)
    root.keyframe_insert(data_path='location', frame=frame)

bpy.ops.object.camera_add(location=(3.3, -10, 4.2))
camera = bpy.context.object
camera.name = 'Camera | portrait three-quarter'
camera.rotation_euler = (Vector((0, 0, 1.8))-camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 4.3
scene.camera = camera

def area(name, location, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=location)
    obj = bpy.context.object
    obj.name = name
    obj.data.energy = energy
    obj.data.shape = 'DISK'
    obj.data.size = size
    obj.data.color = color
    obj.rotation_euler = (Vector((0, 0, 1.7))-obj.location).to_track_quat('-Z', 'Y').to_euler()

area('Key | softbox', ( -3, -4, 7), 550, 5, (1, .94, .87))
area('Fill | mint', (4, -2, 3), 350, 4, (.7, 1, .95))
area('Rim | porcelain edge', (1, 3, 5), 700, 3, (.8, .94, 1))
scene.world = bpy.data.worlds.new('Studio world')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.25, .30, .32, 1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .35
scene.render.engine = 'CYCLES'
scene.cycles.samples = 16
scene.cycles.use_denoising = True
scene.render.resolution_x = 320
scene.render.resolution_y = 384
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.filepath = str(Path(tempfile.gettempdir()) / 'cliniq-robot-frames' / 'robot-')
Path(scene.render.filepath).parent.mkdir(exist_ok=True)
scene.view_settings.view_transform = 'AgX'
scene.frame_set(1)
for screen in bpy.data.screens:
    for area_ui in screen.areas:
        if area_ui.type == 'VIEW_3D':
            area_ui.spaces.active.region_3d.view_perspective = 'CAMERA'
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'assets/mascot/cliniq-robot.blend'))
