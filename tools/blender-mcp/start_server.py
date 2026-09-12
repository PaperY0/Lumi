"""Auto-start the MCP for Blender socket server when Blender launches with a GUI.

Usage (from repo root, PowerShell):
    & "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" --python tools\\blender-mcp\\start_server.py

The addon (blender_mcp_addon.py, installed under
%APPDATA%\\Blender Foundation\\Blender\\5.2\\scripts\\addons) refuses to run in
--background mode because bpy.app.timers never fire there, so Blender must be
started with a window. This script simply enables the addon and presses the
"Connect to Claude" button for you so the server is listening on 127.0.0.1:9876
by the time the MCP bridge (`uvx blender-mcp`) connects.
"""
import bpy
import addon_utils


def _start():
    addon_utils.enable("blender_mcp_addon", default_set=True, persistent=True)
    try:
        bpy.ops.blendermcp.start_server()
        print(f"[lumi] blender-mcp server listening on port {bpy.context.scene.blendermcp_port}", flush=True)
    except Exception as exc:  # noqa: BLE001
        print(f"[lumi] failed to start blender-mcp server: {exc}", flush=True)
    return None  # one-shot timer


# Defer until the window manager exists; running from --python happens before UI is ready.
bpy.app.timers.register(_start, first_interval=0.5)
