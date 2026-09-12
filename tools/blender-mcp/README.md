# Blender MCP toolchain

Lumi's landing-page hero (`frontend/public/models/lumi-hero.glb`) is authored in
Blender and rendered in the browser with three.js (`HeroScene.tsx`).

## Setup (done once, already applied on this machine)

| Piece | Where |
| --- | --- |
| Blender 5.2 LTS | `winget install BlenderFoundation.Blender` |
| uv / uvx | `winget install astral-sh.uv` |
| MCP addon | `blender_mcp_addon.py` → `%APPDATA%\Blender Foundation\Blender\5.2\scripts\addons\` (from github.com/ahujasid/blender-mcp) |
| Claude Code MCP entry | `claude mcp add --scope user blender -- uvx blender-mcp` |

## Daily use

1. Start Blender with the socket server already listening on `127.0.0.1:9876`:
   ```powershell
   & "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" --python tools\blender-mcp\start_server.py
   ```
   (The addon refuses to run under `--background`; a window is required.)
2. Claude Code's `blender` MCP server connects through `uvx blender-mcp`.
3. Without an MCP client you can still drive Blender from a shell:
   ```powershell
   python tools\blender-mcp\bl.py info
   python tools\blender-mcp\bl.py exec tools\blender-mcp\build_hero.py   # rebuilds + exports the GLB
   ```

`build_hero.py` is the source of truth for the asset: a transmissive heart core,
two ribbon sweeps (rose / lilac), a thin gold halo ring and five emissive pearls,
all coloured from Lumi's design tokens.
