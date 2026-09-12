"""Thin client for the MCP-for-Blender socket (port 9876).
Lets us drive Blender from the shell exactly the way the MCP bridge does:
    python tools/blender-mcp/bl.py exec path/to/script.py
    python tools/blender-mcp/bl.py info
"""
import json, socket, sys, pathlib

HOST, PORT = "127.0.0.1", 9876


def send(cmd_type, params=None, timeout=300):
    s = socket.create_connection((HOST, PORT), timeout=timeout)
    s.sendall(json.dumps({"type": cmd_type, "params": params or {}}).encode())
    buf = b""
    while True:
        chunk = s.recv(65536)
        if not chunk:
            break
        buf += chunk
        try:
            return json.loads(buf.decode())
        except json.JSONDecodeError:
            continue
    return json.loads(buf.decode())


if __name__ == "__main__":
    what = sys.argv[1]
    if what == "info":
        print(json.dumps(send("get_scene_info"), indent=1, ensure_ascii=False))
    elif what == "exec":
        code = pathlib.Path(sys.argv[2]).read_text(encoding="utf-8")
        r = send("execute_code", {"code": code})
        print(json.dumps(r, indent=1, ensure_ascii=False)[:6000])
    else:
        print(json.dumps(send(what), indent=1, ensure_ascii=False)[:4000])
