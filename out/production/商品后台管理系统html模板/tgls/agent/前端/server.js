

// 导入所需的模块
const express = require('express');
const Influx = require('influx');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
// 创建 Express 应用
const app = express();
app.use(cors());
// 创建 InfluxDB 客户端
const influx = new Influx.InfluxDB({
    host: 'localhost', // InfluxDB服务器地址
    port: 8086,        // InfluxDB端口
    database: 'history', // 要连接的数据库名
});
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // 指定文件上传的目录，相对路径基于项目根目录
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) // 保持原始文件名
    }
});
// 检查文件的路由
app.get('/checkFile', async (req, res) => {
    try {
        const filename = req.query.filename;
        // 假设文件存储在服务器的'uploads'目录下
        const filePath = path.join(__dirname, 'uploads', filename);
        // 使用fs.access来检查文件是否存在且可访问
        await fs.access(filePath, fs.constants.R_OK);
        res.status(200).json({ exists: true }); // 文件存在且可读
    } catch (error) {
        // 如果文件不存在或无法访问，fs.access会抛出错误
        if (error.code === 'ENOENT') {
            res.status(404).json({ exists: false, message: 'File not found or inaccessible.' });
        } else {
            res.status(500).json({ error: 'An error occurred while checking the file.' });
        }
    }
});
app.get('/download', async (req, res) => { // 修改为async函数
    try {
        const fileName = decodeURIComponent(req.query.filename);
        const filePath = path.join(__dirname, 'uploads', fileName);

        // 使用fs.promises.access来检查文件是否存在
        await fs.access(filePath, fs.constants.R_OK);

        // 文件存在，开始下载
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error downloading the file.");
            }
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).send("File not found.");
        } else {
            console.error(error);
            res.status(500).send("Error processing the request.");
        }
    }
});
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send(`1`);
});
// 定义路由处理程序
app.get('/data', (req, res) => {
    // 查询数据库获取数据
    influx.query('SELECT * FROM testdata')
        .then(results => {
            // 提取results中的data数据数组
            const data = results.map(result => result.data);
            // 发送数据给前端页面
            res.json(data);
        })
        .catch(error => {
            console.error('Error fetching data from InfluxDB', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

app.get('/lastdata002', (req, res) => {
    // 定义两个查询
    const query3 = influx.query('SELECT last(data) FROM "testdata" WHERE "PredictFunctionID"=\'002\'');
    const query4 = influx.query('SELECT last(state) FROM "testdata" WHERE "PredictFunctionID"=\'002\'');

    // 使用Promise.all来并行执行查询
    Promise.all([query3, query4]).then(([results3, results4]) => {
        // 初始化累加器
        const lastDataAcc1 = [];
        const timeAcc1 = [];
        const lastStateAcc1 = [];

        // 处理第一个查询的结果
        results3.groupRows.forEach(groupRow => {
            groupRow.rows.forEach(row => {
                if (row.last !== undefined) {
                    lastDataAcc1.push(row.last);
                }
                if (row.time !== undefined) {
                    let date1 = new Date(row.time);
                    // 减去8小时
                    if(date1.getHours()>=8)
                    {
                        date1.setHours(date1.getHours() - 8);
                    }
                    else
                    {
                        date1.setMonth(date1.getMonth() - 1);
                        date1.setHours(date1.getHours()+24 - 8);
                    }
                    const formattedTime1 = `${date1.getHours().toString().padStart(2, '0')}:${date1.getMinutes().toString().padStart(2, '0')}`;
                    timeAcc1.push(formattedTime1);
                }
            });
        });

        // 处理第二个查询的结果
        results4.groupRows.forEach(groupRow => {
            groupRow.rows.forEach(row => {
                if (row.last !== undefined) {
                    lastStateAcc1.push(row.last);
                }
            });
        });


        // 构造响应数据
        const responseData1 = {
            last_data: lastDataAcc1,
            time: timeAcc1,
            last_state: lastStateAcc1
        };

        // 发送响应
        res.json(responseData1);
    }).catch(error => {
        // 如果有任何查询失败，捕获错误并发送500响应
        console.error('Error fetching data from InfluxDB', error);
        res.status(500).json({ error: 'Internal server error' });
    });


});
app.get('/lastdata001', (req, res) => {
    // 定义两个查询
    const query1 = influx.query('SELECT last(data) FROM "testdata" WHERE "PredictFunctionID"=\'001\'');
    const query2 = influx.query('SELECT last(state) FROM "testdata" WHERE "PredictFunctionID"=\'001\'');

    // 使用Promise.all来并行执行查询
    Promise.all([query1, query2]).then(([results1, results2]) => {
        // 初始化累加器
        const lastDataAcc = [];
        const timeAcc = [];
        const lastStateAcc = [];

        // 处理第一个查询的结果
        results1.groupRows.forEach(groupRow => {
            groupRow.rows.forEach(row => {
                if (row.last !== undefined) {
                    lastDataAcc.push(row.last);
                }
                if (row.time !== undefined) {
                    let date = new Date(row.time);
                    if(date.getHours()>=8)
                    {
                        date.setHours(date.getHours() - 8);
                    }
                    else
                    {
                        date.setMonth(date.getMonth() - 1);
                        date.setHours(date.getHours()+24 - 8);
                    }
                    const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    timeAcc.push(formattedTime);
                }
            });
        });

        // 处理第二个查询的结果
        results2.groupRows.forEach(groupRow => {
            groupRow.rows.forEach(row => {
                if (row.last !== undefined) {
                    lastStateAcc.push(row.last);
                }
            });
        });


        // 构造响应数据
        const responseData = {
            last_data: lastDataAcc,
            time: timeAcc,
            last_state: lastStateAcc
        };

        // 发送响应
        res.json(responseData);
    }).catch(error => {
        // 如果有任何查询失败，捕获错误并发送500响应
        console.error('Error fetching data from InfluxDB', error);
        res.status(500).json({ error: 'Internal server error' });
    });


});


app.get('/orderdata', (req, res) => {
    // 获取查询参数：开始时间和结束时间
    const starttime = req.query.starttime;
    const endtime = req.query.endtime;
    // const starttime = '2024-05-01T00:00:00';
    // const endtime = '2024-05-12T23:59:59';
    // 检查是否提供了开始时间和结束时间参数
    if (!starttime || !endtime) {
        return res.status(400).json({ error: 'Missing starttime or endtime parameters' });
    }

    // 查询数据库获取数据
    influx.query(`SELECT * FROM testdata WHERE time >= '${starttime}' AND time <= '${endtime}'`)
        .then(results => {

            // 提取所有的数据值
            const orderDataValues = results.map(result => {
                if(result.state!=null){
                    return {
                        time: result.time,
                        data: result.data,
                        tag: result.state     };
                }else if(result.state_1!=null){
                    return {
                        time: result.time,
                        data: result.data,
                        tag: result.state_1     };
                }
            });

            res.json(orderDataValues);

        })
        .catch(error => {
            console.error('Error fetching data from InfluxDB', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});




// 启动服务器，监听端口0
const port = 40000; // 你可以根据需要修改端口号
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

