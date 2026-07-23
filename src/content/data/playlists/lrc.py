import json
from pathlib import Path

def replace_lrc(input_file, yrc_path, output_path=None):
    """
    将 lironghao.json 中每首歌的 lrc 字段替换为 yrc.json 中同名歌曲的 lrc 字段。
    
    Args:
        input_file (str or Path): lironghao.json 文件路径
        yrc_path (str or Path): yrc.json 文件路径
        output_path (str or Path, optional): 输出文件路径，默认覆盖原文件
    """
    # 读取两个 JSON 文件
    with open(input_file, 'r', encoding='utf-8') as f:
        lironghao_data = json.load(f)
    with open(yrc_path, 'r', encoding='utf-8') as f:
        yrc_data = json.load(f)

    # 构建 yrc 中歌曲名到 lrc 的映射
    yrc_lrc_map = {song['name']: song['lrc'] for song in yrc_data.get('songs', []) if 'name' in song and 'lrc' in song}

    # 遍历 lironghao 的 songs，替换 lrc
    replaced_count = 0
    for song in lironghao_data.get('songs', []):
        name = song.get('name')
        if name and name in yrc_lrc_map:
            song['lrc'] = yrc_lrc_map[name]
            replaced_count += 1

    # 确定输出路径
    if output_path is None:
        output_path = input_file  # 默认覆盖原文件

    # 写入结果
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(lironghao_data, f, ensure_ascii=False, indent=2)

    print(f"替换完成，共替换 {replaced_count} 首歌曲的 lrc 字段。")
    print(f"结果已保存至: {output_path}")

if __name__ == "__main__":
    # 使用示例：文件在脚本所在目录
    script_dir = Path(__file__).parent
    input_file = script_dir / "wanglihong.json"
    yrc_path = script_dir / "yrc.json"
    # 若想直接覆盖原文件，可调用 replace_lrc(input_file, yrc_path)
    replace_lrc(input_file, yrc_path)