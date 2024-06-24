// 导入所需的模块
const express = require('express');
const Influx = require('influx');
const cors = require('cors');

// 创建 Express 应用
const app = express();
app.use(cors());

// 创建 InfluxDB 客户端
const influx = new Influx.InfluxDB({
    host: 'localhost', // InfluxDB 服务器地址
    port: 8086,        // InfluxDB 端口
    database: 'history', // 要连接的数据库名
});

// 定义查询数据的路由
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
                return {
                    time: result.time,
                    data: result.data,
                    tag: result.state     };
            });

            res.json(orderDataValues);
        })
        .catch(error => {
            console.error('Error fetching data from InfluxDB', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});



// 定义查询数据的路由
app.get('/Alldata', (req, res) => {

    // 查询数据库获取数据
    influx.query(`SELECT * FROM testdata`)
        .then(results => {
            // 提取所有的数据值
            const AllDataValues = results.map(result => {
                return {
                    time: result.time,
                    data: result.data,
                    tag: result.state     };
            });

            res.json(AllDataValues);
        })
        .catch(error => {
            console.error('Error fetching data from InfluxDB', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});
// 启动服务器，监听端口
const port = 50000; // 你可以根据需要修改端口号
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

