import json

def convert_music_file(input_file='./src/content/data/playlists/wuyuetian.json', output_file='./src/content/data/playlists/wuyuetian_converted.json'):
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            original_data = json.load(f)
        
        if not isinstance(original_data, list):
            raise ValueError('JSON 文件根元素应为数组')
        
        converted_data = []
        for item in original_data:
            # 提取需要的字段，缺失则设为 None 或空字符串（按需调整）
            new_item = {
                'name': item.get('name'),
                'album': item.get('album'),
                'artist': item.get('artist'),
                'url': item.get('url'),
                'lrc': item.get('lrc'),
                'pic': item.get('pic')
            }
            converted_data.append(new_item)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(converted_data, f, indent=2, ensure_ascii=False)
        
        print(f'转换完成！共处理 {len(converted_data)} 条数据，已保存至 {output_file}')
    
    except FileNotFoundError:
        print(f'错误：找不到文件 {input_file}')
    except json.JSONDecodeError:
        print(f'错误：{input_file} 不是有效的 JSON 文件')
    except Exception as e:
        print(f'发生错误：{e}')

if __name__ == '__main__':
    convert_music_file()