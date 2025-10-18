---
title: Windows 系统中使用 cuDF 加速 Pandas 教程(含 Python 安装)
date: 2025-10-18 15:01:30
updated:
tags: [Development]
categories: [cuDF]
keywords: 
description:
top_img: https://imgbed.904002.xyz/file/blog/background/post/top_img/Development.jpg
comments:
cover: https://imgbed.904002.xyz/file/blog/background/post/top_img/Development.jpg
toc_style_simple:
copyright:
copyright_author:
copyright_author_href:
copyright_url:
copyright_info:
swiper_index: 1
top_group_index: 1
background: "#33baefff"
---
# Windows 系统中使用 cuDF 加速 Pandas 教程(含 Python 安装)

------

在数据分析领域，Pandas 是一个功能强大的 Python 库，它使得数据处理和分析变得简单而高效。然而，当处理大规模数据集时，Pandas 的性能可能会成为瓶颈。在这种情况下，我们可以使用GPU的并行运算来加速处理，cuDF 就是这样的一个工具。

然而，cuDF 目前只支持 Linux 环境，我们可以通过 WSL 来在 Windows 系统中使用 cuDF。

> [!TIP]
>
> 本教程在 Win11 专业版环境下实现

------

## 1. 安装 Python

### 1.1 下载安装包

[Python官网](https://www.python.org/downloads/windows/)(访问较慢)

[夸克网盘](https://pan.quark.cn/s/9243956fe8fb)(需下载夸克)

[NAS](https://s.fnnas.net/s/04a896cc758742e5a6)(直接下载)

### 1.2 安装步骤

双击打开安装包后建议勾选下面两项

![xw_20251014143234](C:\Users\admin\Desktop\xw_20251014143234.png)

然后选择 Customize installation (自定义安装)

![xw_20251014143253](C:\Users\admin\Desktop\xw_20251014143253.png)

之后点击 Next

![xw_20251014144045](C:\Users\admin\Desktop\xw_20251014144045.png)

自定义安装路径

解释其他选项：引用 CSDN [原文链接](https://blog.csdn.net/sensen_kiss/article/details/141940274)

Install Python 3.12 for all users：为所有用户安装，效果与前面的 py launcher for all users (requires admin privileges) 一致

Associate files with Python (requires the 'py' launcher) ：让系统自动将 Python 关联到特定的文件类型，使得在文件资源管理器中双击 Python 脚本文件时，系统会自动使用 Python 解释器来运行这些脚本

Create shortcuts for installed applications：创建桌面快捷方式

Add Python to environment variables：选择这个选项会将 Python 解释器的路径添加到系统的环境变量中，这样就可以在命令行中直接运行 Python 解释器而不需要输入完整的路径，本来就勾着的就不动了

Precompile standard library：对 Python 标准库进行预编译，以提高标准库模块的导入速度，听着很厉害但是对新手来说不重要，可以勾可以不勾

Download debugging symbols：给开发人员和调试人员用的调试符号

Download debug binaries (requires VS 2017 or later)：给开发人员和调试人员用的调试版本的二进制文件

![小爱鼠标截图_20251018024138](C:\Users\admin\Desktop\小爱鼠标截图_20251018024138.png)

点击Install进行安装

### 1.3 验证是否安装成功

win+r 输入 cmd 打开黑窗口，之后输入 `python`，如果出现如图样式则安装成功

![xw_20251014144533](C:\Users\admin\Desktop\xw_20251014144533.png)

------

## 2. 安装代码编辑器(这里推荐 VS Code)

### 2.1 下载 VS Code

[官网下载]([Visual Studio Code - Code Editing. Redefined](https://code.visualstudio.com/))

![xw_20251014145554](C:\Users\admin\Desktop\xw_20251014145554.png)

### 2.2 安装步骤

同意协议，选择安装位置，之后勾选全部选项点击安装

![xw_20251014144929](C:\Users\admin\Desktop\xw_20251014144929.png)

### 2.3汉化(可选)

点击左边扩展，搜索 Chinese，找到汉化插件

![找到汉化插件](C:\Users\admin\Desktop\找到汉化插件.png)

点击安装，按要求重启 VS Code

![点击安装汉化插件](C:\Users\admin\Desktop\点击安装汉化插件.png)

------

## 3. 安装 WSL

### 3.1 开启 Windows 的 WSL 与虚拟机(Hyper-V)功能

> [!CAUTION]
>
> Windows10/11家庭版没有 Hyper-V 功能。
>
> 如果想要使用，可以升级为专业版、企业版、教育版等。
>
> 或者桌面上新建一个文本文档，复制以下命令粘贴进去。左上角点击文件—另存为，保存类型选择所有文件，文件名为Hyper-V.cmd，点击保存。
>
> ```
> 　　pushd “%~dp0”
> 　　dir /b %SystemRoot%\servicing\Packages\*Hyper-V*.mum 》hyper-v.txt
> 　　for /f %%i in （‘findstr /i 。 hyper-v.txt 2^》nul’） do dism /online /norestart /add-package：“%SystemRoot%\servicing\Packages\%%i”
> 　　del hyper-v.txt
> 　　Dism /online /enable-feature /featurename:Microsoft-Hyper-V-All /LimitAccess /ALL
> ```
>
> 右键以管理员身份运行，等待命令执行，操作成功之后，输入Y重启电脑。

> [!TIP]
>
> Hyper-V 与 VMware 之间有一定冲突，如果打开了 Hyper-V 但又想使用 VMware，则需要关闭 Hyper-V 功能或者在安装 VMware 的时候打开兼容。

**检查系统要求**：确保您的计算机硬件支持虚拟化技术(如 Intel VT-x 或 AMD-V)，如果有此功能则进入Bios里打开 Intel VT-x 或者 AMD-V 功能。

在 Win11 开始菜单搜索“Windows 功能”，找到虚拟机平台、Hyper-V与适用于 Linux 的 Windows 子系统三个选项并勾选。

之后按要求重启电脑。

### 3.2 安装 WSL

##### 3.2.1 安装 WSL

> [!NOTE]
>
> WSL 默认安装在 C 盘下，如想安装在其他盘则往下看。

打开 PowerShell 输入如下命令，默认安装最新的 Ubuntu 发行版。

```
wsl --install
```

如果希望选择其他类型的发行版，可以通过如下命令查看。

```
wsl --list --online
```

然后选择需要的其他类型版本通过如下命令进行安装。

```
wsl --install -d <发行版名称>
```

安装成功后重启电脑。启动 Ubuntu 按照提示，创建账户与密码。

##### 3.2.2 迁移 WSL 到其他盘(可选)

按照上述步骤安装后，WSL 将会安装在 C 盘，并占据大量空间。

此时可以把 WSL 迁移到其他盘。(C 盘空间足够大可忽略)

1） 停止正在运行的 WSL

```
wsl --shutdown
```

2）将需要迁移的 Linux，进行导出

```
wsl --export Ubuntu D:/export.tar
```

3）导出完成之后，将原有的 Linux 卸载

```
wsl --unregister Ubuntu
```

4） 然后将导出的文件放到需要保存的地方，进行导入即可

```
wsl --import Ubuntu D:\export\ D:\export.tar --version 2
```

------

## 4. 安装cuDF

### 4.1安装 CUDA Toolkit

##### 4.1.1 输入以下代码查看 NVIDIA GPU

```
nvidia-smi
```

![小爱鼠标截图_20251014065420](C:\Users\admin\Desktop\小爱鼠标截图_20251014065420.png)

##### 4.1.2 更新 WSL 系统包

```
sudo apt update
```

##### 4.1.3 下载 CUDA Toolkit

[官网](https://link.zhihu.com/?target=https%3A//developer.nvidia.com/cuda-toolkit-archive)

选择要安装的版本

![屏幕截图_14-10-2025_19016_developer.nvidia.com](C:\Users\admin\Desktop\屏幕截图_14-10-2025_19016_developer.nvidia.com.jpeg)

按照如图选择，复制代码

![屏幕截图_14-10-2025_1903_developer.nvidia.com](C:\Users\admin\Desktop\屏幕截图_14-10-2025_1903_developer.nvidia.com.jpeg)

##### 4.1.4 将 4.1.3 中复制的代码粘贴并执行

启动 WSL

```
wsl
```

粘贴并执行

执行过程中会让输入密码，输入3.2.1中创建的密码

##### 4.1.5 配置环境变量

安装完成后，需要将 CUDA 的路径添加到环境变量中

打开 WSL 中的 `~/.bashrc` 文件

```
nano ~/.bashrc
```

在文件末尾添加以下内容(如果安装的是其他版本，请调整路径中的版本号)

```
export PATH=/usr/local/cuda-12.4/bin${PATH:+:${PATH}}
export LD_LIBRARY_PATH=/usr/local/cuda-12.4/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
```

保存文件后，执行以下命令使配置立即生效

```
source ~/.bashrc
```

##### 4.1.6 验证安装

**检查 CUDA 编译器**

在WSL终端运行 `nvcc -V`，如果输出 CUDA 编译器版本信息，则说明 CUDA Toolkit 安装和环境变量配置成功。

**检查 GPU 识别**

在 WSL 终端运行 `nvidia-smi`，该命令应能正确显示 GPU 状态。如果能正常运行，恭喜你，WSL 已经可以识别并使用你的 GPU 了。

### 4.2 安装 cuDF

##### 4.2.1 创建虚拟环境

安装软件包

```
sudo apt install python3.12-venv
```

创建虚拟环境

```
python3 -m venv ~/myenv
```

进入虚拟环境

```
source ~/myenv/bin/activate
```

##### 4.2.2 安装 cuDF

```
pip install --upgrade pip
pip install cudf-cu12 --extra-index-url=https://pypi.nvidia.com(选择适合自己版本号)
```

##### 4.2.3 验证 cuDF 安装

在WSL中输入 python 启动 python

输入以下代码并回车，若没有报错则安装成功

```
import cudf
```

------

## 5. 在 VS Code 中使用 cuDF 加速代码

### 5.1 确保 VS Code 能识别 WSL 环境。

##### 5.1.1 安装扩展

在 VS Code 的扩展商店中，搜索并安装 **`WSL`** 扩展。

##### 5.1.2 连接至 WSL

在VS Code中，按下 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS) 打开命令面板

输入以下代码并执行

```
WSL: Connect to WSL
```

> [!NOTE]
>
> 也可点击左下角的箭头标志，连接 WSL

按照提示保存完成后，VS Code左下角会显示类似 **`WSL: Ubuntu`** 的标识，表示你已进入WSL环境。

![WSL Ubuntu](C:\Users\admin\Desktop\WSL Ubuntu.png)

### 5.2 为 WSL 安装 Python 扩展

再次打开扩展面板，搜索 Python ，找到 Python 扩展，安装到 WSL 中。安装后可能需要重新加载VS Code。

![Python扩展](C:\Users\admin\Desktop\Python扩展.png)

### 5.3 设置Python虚拟环境解释器

##### 5.3.1 激活虚拟环境

```
source myenv/bin/activate
```

##### 5.3.2 在 VS Code 中选择解释器

 `Ctrl+Shift+P` 打开命令面板，输入 **`Python: Select Interpreter`** 选择解释器

点击**输入解释器路径，找到路径包含 **，按照`your_project_path/myenv/bin/python`的路径选择(在4.2.1创建过的虚拟环境)

![选择解释器](C:\Users\admin\Desktop\选择解释器.png)

##### 5.3.3 验证解释器

创建一个测试文件，例如 `test_environment.py`，输入以下代码并运行

```
import sys
print(sys.executable)
import pandas as pd
import cudf
print("cuDF imported successfully!")
```

如果输出例如以下信息指向你的虚拟环境，说明环境配置正确。

```
/home/zzz/myenv/bin/python # 为你的python路径
cuDF imported successfully!
```

## 5.4 测试 cuDF 是否可用

创建test.py文件，输入以下代码并运行

```
# simple_diagnose.py
import sys

print("=== 环境诊断 ===")
print(f"Python路径: {sys.executable}")
print(f"Python版本: {sys.version}")

# 尝试导入cuDF
try:
    import cudf
    print("✅ cuDF导入成功")
    # 尝试获取版本信息
    if hasattr(cudf, '__version__'):
        print(f"cuDF版本: {cudf.__version__}")
    else:
        print("cuDF版本: 未知")
        
    # 测试基本功能
    df = cudf.DataFrame({'a': [1, 2, 3]})
    print("✅ cuDF基本功能正常")
    print(f"测试DataFrame: {df}")
    
except ImportError as e:
    print(f"❌ cuDF导入失败: {e}")
    print("建议: 重新安装cuDF")
except Exception as e:
    print(f"⚠️ cuDF功能异常: {e}")

# 检查其他相关包
packages = ['numpy', 'pandas']
for pkg in packages:
    try:
        __import__(pkg)
        print(f"✅ {pkg} 已安装")
    except ImportError:
        print(f"❌ {pkg} 未安装")
```

若输出例如以下信息，则安装成功

```
=== 环境诊断 ===
Python路径: /home/zzz/myenv/bin/python
Python版本: 3.12.3 (main, Aug 14 2025, 17:47:21) [GCC 13.3.0]
✅ cuDF导入成功
cuDF版本: 25.10.00
✅ cuDF基本功能正常
测试DataFrame:    a
0  1
1  2
2  3
✅ numpy 已安装
✅ pandas 已安装
```

------

## 6.测试 cuDF 加持下的运行速度

创建一个py文件，输入以下代码并运行

> [!NOTE]
>
> 此测试代码由AI生成，没有进行验证

```
# cudf_performance_demo.py
import time
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import os

def create_test_data(num_rows=5_000_000):
    """创建测试数据集"""
    print(f"生成 {num_rows:,} 行测试数据...")
    
    np.random.seed(42)  # 确保可重复性
    
    data = {
        'customer_id': np.random.randint(1, 10000, num_rows),
        'product_id': np.random.randint(1, 500, num_rows),
        'sales_amount': np.random.exponential(100, num_rows),
        'quantity': np.random.randint(1, 10, num_rows),
        'discount': np.random.uniform(0, 0.3, num_rows),
        'region': np.random.choice(['North', 'South', 'East', 'West'], num_rows),
        'category': np.random.choice(['Electronics', 'Clothing', 'Food', 'Books', 'Home'], num_rows),
        'rating': np.random.randint(1, 6, num_rows),
        'date': pd.date_range('2023-01-01', periods=num_rows, freq='T')
    }
    
    return data

def pandas_operations(data):
    """执行pandas操作"""
    print("\n🏁 开始Pandas测试...")
    
    # 创建DataFrame
    start_time = time.time()
    pdf = pd.DataFrame(data)
    creation_time = time.time() - start_time
    
    # 操作1: 基本统计
    start_time = time.time()
    basic_stats = pdf.groupby('region').agg({
        'sales_amount': ['mean', 'sum', 'count'],
        'quantity': ['mean', 'sum'],
        'rating': 'mean'
    })
    op1_time = time.time() - start_time
    
    # 操作2: 复杂过滤和计算
    start_time = time.time()
    filtered_data = pdf[
        (pdf['sales_amount'] > 50) & 
        (pdf['rating'] >= 4) &
        (pdf['region'].isin(['North', 'South']))
    ].copy()
    filtered_data['discounted_sales'] = filtered_data['sales_amount'] * (1 - filtered_data['discount'])
    filtered_data['sales_category'] = pd.cut(filtered_data['discounted_sales'], 
                                           bins=[0, 50, 100, 200, float('inf')],
                                           labels=['Low', 'Medium', 'High', 'Very High'])
    op2_time = time.time() - start_time
    
    # 操作3: 时间序列分析
    start_time = time.time()
    pdf['month'] = pdf['date'].dt.month
    monthly_sales = pdf.groupby(['month', 'category'])['sales_amount'].sum().unstack()
    op3_time = time.time() - start_time
    
    # 操作4: 多级分组和复杂聚合
    start_time = time.time()
    customer_analysis = pdf.groupby(['customer_id', 'region']).agg({
        'sales_amount': ['sum', 'mean', 'count'],
        'quantity': 'sum',
        'rating': 'mean'
    }).round(2)
    customer_analysis.columns = ['_'.join(col).strip() for col in customer_analysis.columns.values]
    op4_time = time.time() - start_time
    
    total_time = creation_time + op1_time + op2_time + op3_time + op4_time
    
    return {
        'creation': creation_time,
        'basic_stats': op1_time,
        'complex_filter': op2_time,
        'time_series': op3_time,
        'multi_group': op4_time,
        'total': total_time
    }, basic_stats, filtered_data, monthly_sales, customer_analysis

def cudf_operations(data):
    """执行cuDF操作"""
    print("\n⚡ 开始cuDF测试...")
    
    try:
        import cudf
        
        # 创建DataFrame
        start_time = time.time()
        gdf = cudf.DataFrame(data)
        creation_time = time.time() - start_time
        
        # 操作1: 基本统计
        start_time = time.time()
        basic_stats = gdf.groupby('region').agg({
            'sales_amount': ['mean', 'sum', 'count'],
            'quantity': ['mean', 'sum'],
            'rating': 'mean'
        })
        op1_time = time.time() - start_time
        
        # 操作2: 复杂过滤和计算
        start_time = time.time()
        filtered_data = gdf[
            (gdf['sales_amount'] > 50) & 
            (gdf['rating'] >= 4) &
            (gdf['region'].isin(['North', 'South']))
        ].copy()
        filtered_data['discounted_sales'] = filtered_data['sales_amount'] * (1 - filtered_data['discount'])
        filtered_data['sales_category'] = cudf.cut(filtered_data['discounted_sales'], 
                                                 bins=[0, 50, 100, 200, float('inf')],
                                                 labels=['Low', 'Medium', 'High', 'Very High'])
        op2_time = time.time() - start_time
        
        # 操作3: 时间序列分析
        start_time = time.time()
        gdf['month'] = gdf['date'].dt.month
        monthly_sales = gdf.groupby(['month', 'category'])['sales_amount'].sum().unstack()
        op3_time = time.time() - start_time
        
        # 操作4: 多级分组和复杂聚合
        start_time = time.time()
        customer_analysis = gdf.groupby(['customer_id', 'region']).agg({
            'sales_amount': ['sum', 'mean', 'count'],
            'quantity': 'sum',
            'rating': 'mean'
        }).round(2)
        customer_analysis.columns = ['_'.join(col).strip() for col in customer_analysis.columns.values]
        op4_time = time.time() - start_time
        
        total_time = creation_time + op1_time + op2_time + op3_time + op4_time
        
        return {
            'creation': creation_time,
            'basic_stats': op1_time,
            'complex_filter': op2_time,
            'time_series': op3_time,
            'multi_group': op4_time,
            'total': total_time
        }, basic_stats, filtered_data, monthly_sales, customer_analysis
        
    except ImportError:
        print("❌ cuDF未安装，跳过GPU测试")
        return None, None, None, None, None
    except Exception as e:
        print(f"❌ cuDF测试失败: {e}")
        return None, None, None, None, None

def verify_results(pandas_results, cudf_results):
    """验证pandas和cuDF结果的一致性"""
    if cudf_results is None:
        return
    
    print("\n🔍 验证结果一致性...")
    
    # 转换cuDF结果为pandas格式进行比较
    cudf_basic_stats = cudf_results[1].to_pandas() if cudf_results[1] is not None else None
    cudf_filtered = cudf_results[2].to_pandas() if cudf_results[2] is not None else None
    cudf_monthly = cudf_results[3].to_pandas() if cudf_results[3] is not None else None
    cudf_customer = cudf_results[4].to_pandas() if cudf_results[4] is not None else None
    
    checks = []
    
    # 检查基本统计
    if cudf_basic_stats is not None and pandas_results[1] is not None:
        diff = np.abs(pandas_results[1] - cudf_basic_stats).max().max()
        checks.append(('基本统计', diff < 0.01))
    
    # 检查过滤数据行数
    if cudf_filtered is not None and pandas_results[2] is not None:
        row_diff = abs(len(pandas_results[2]) - len(cudf_filtered))
        checks.append(('数据行数', row_diff == 0))
    
    print("一致性检查结果:")
    for check_name, passed in checks:
        status = "✅ 通过" if passed else "❌ 失败"
        print(f"  {check_name}: {status}")

def visualize_comparison(pandas_times, cudf_times):
    """可视化性能对比结果"""
    if cudf_times is None:
        print("无法生成图表：cuDF测试数据缺失")
        return
    
    operations = ['数据创建', '基本统计', '复杂过滤', '时间序列', '多级分组', '总计']
    pandas_values = [
        pandas_times['creation'],
        pandas_times['basic_stats'], 
        pandas_times['complex_filter'],
        pandas_times['time_series'],
        pandas_times['multi_group'],
        pandas_times['total']
    ]
    cudf_values = [
        cudf_times['creation'],
        cudf_times['basic_stats'],
        cudf_times['complex_filter'], 
        cudf_times['time_series'],
        cudf_times['multi_group'],
        cudf_times['total']
    ]
    
    # 计算加速比
    speedups = [pandas_values[i] / cudf_values[i] for i in range(len(operations))]
    
    # 创建图表
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
    
    # 图表1: 执行时间对比
    x = np.arange(len(operations))
    width = 0.35
    
    bars1 = ax1.bar(x - width/2, pandas_values, width, label='Pandas (CPU)', color='#1f77b4', alpha=0.8)
    bars2 = ax1.bar(x + width/2, cudf_values, width, label='cuDF (GPU)', color='#ff7f0e', alpha=0.8)
    
    ax1.set_xlabel('操作类型', fontsize=12)
    ax1.set_ylabel('执行时间 (秒)', fontsize=12)
    ax1.set_title('Pandas vs cuDF 执行时间对比', fontsize=14, fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(operations, rotation=45, ha='right')
    ax1.legend(fontsize=10)
    ax1.grid(axis='y', alpha=0.3)
    
    # 添加数值标签
    for bar in bars1:
        height = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2., height + max(pandas_values + cudf_values)*0.01,
                f'{height:.3f}s', ha='center', va='bottom', fontsize=8)
    
    for bar in bars2:
        height = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2., height + max(pandas_values + cudf_values)*0.01,
                f'{height:.3f}s', ha='center', va='bottom', fontsize=8)
    
    # 图表2: 加速比
    colors = ['green' if x >= 1 else 'red' for x in speedups]
    bars3 = ax2.bar(operations, speedups, color=colors, alpha=0.7)
    
    ax2.set_xlabel('操作类型', fontsize=12)
    ax2.set_ylabel('加速比 (Pandas/cuDF)', fontsize=12)
    ax2.set_title('cuDF GPU加速效果', fontsize=14, fontweight='bold')
    ax2.set_xticklabels(operations, rotation=45, ha='right')
    ax2.grid(axis='y', alpha=0.3)
    ax2.axhline(y=1, color='red', linestyle='--', alpha=0.5, label='基准线')
    ax2.legend()
    
    # 添加加速比数值
    for i, (bar, speedup) in enumerate(zip(bars3, speedups)):
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                f'{speedup:.1f}x', ha='center', va='bottom', fontsize=10, fontweight='bold')
    
    plt.tight_layout()
    
    # 保存图表
    timestamp = int(time.time())
    filename = f'cudf_performance_{timestamp}.png'
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"\n📊 性能图表已保存: {filename}")
    
    plt.show()

def print_detailed_report(pandas_times, cudf_times):
    """打印详细性能报告"""
    print("\n" + "="*60)
    print("📈 详细性能报告")
    print("="*60)
    
    if cudf_times is None:
        print("只有Pandas测试结果:")
        for op, time_val in pandas_times.items():
            print(f"  {op:15}: {time_val:.4f}秒")
        return
    
    print(f"{'操作':15} | {'Pandas (秒)':>12} | {'cuDF (秒)':>10} | {'加速比':>8}")
    print("-" * 60)
    
    operations = [
        ('creation', '数据创建'),
        ('basic_stats', '基本统计'),
        ('complex_filter', '复杂过滤'),
        ('time_series', '时间序列'),
        ('multi_group', '多级分组'),
        ('total', '总计')
    ]
    
    for op_key, op_name in operations:
        pandas_time = pandas_times[op_key]
        cudf_time = cudf_times[op_key]
        speedup = pandas_time / cudf_time
        
        print(f"{op_name:15} | {pandas_time:12.4f} | {cudf_time:10.4f} | {speedup:8.2f}x")

def main():
    """主函数"""
    print("🚀 Pandas vs cuDF 性能对比演示")
    print("=" * 50)
    
    # 根据可用内存调整数据大小
    try:
        import psutil
        available_memory = psutil.virtual_memory().available / (1024**3)  # GB
        if available_memory < 8:
            num_rows = 2_000_000  # 200万行
            print(f"检测到可用内存: {available_memory:.1f}GB，使用 {num_rows:,} 行数据")
        else:
            num_rows = 5_000_000  # 500万行
            print(f"检测到可用内存: {available_memory:.1f}GB，使用 {num_rows:,} 行数据")
    except:
        num_rows = 3_000_000  # 默认300万行
        print(f"使用默认 {num_rows:,} 行数据")
    
    # 生成测试数据
    data = create_test_data(num_rows)
    
    # 执行测试
    pandas_times, p_stats, p_filtered, p_monthly, p_customer = pandas_operations(data)
    cudf_times, c_stats, c_filtered, c_monthly, c_customer = cudf_operations(data)
    
    # 验证结果
    verify_results((p_stats, p_filtered, p_monthly, p_customer), 
                  (c_stats, c_filtered, c_monthly, c_customer))
    
    # 生成报告和图表
    print_detailed_report(pandas_times, cudf_times)
    visualize_comparison(pandas_times, cudf_times)
    
    # 总结
    print("\n" + "="*60)
    print("🎯 性能测试总结")
    print("="*60)
    
    if cudf_times is not None:
        total_speedup = pandas_times['total'] / cudf_times['total']
        print(f"总体加速比: {total_speedup:.2f}x")
        
        if total_speedup > 1:
            print("✅ cuDF GPU加速效果显著！")
        else:
            print("⚠️ cuDF性能未达到预期，可能的原因：")
            print("  - 数据量太小，GPU优势不明显")
            print("  - 操作类型不适合GPU加速")
            print("  - GPU内存或计算资源限制")
    else:
        print("❌ 无法进行cuDF测试，请检查cuDF安装")

if __name__ == "__main__":
    main()
```

