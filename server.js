

// 导入所需的模块
const express = require('express');
const Influx = require('influx');
const cors = require('cors');
// 创建 Express 应用
const app = express();
app.use(cors());
// 创建 InfluxDB 客户端
const influx = new Influx.InfluxDB({
    host: 'localhost', // InfluxDB服务器地址
    port: 8086,        // InfluxDB端口
    database: 'history', // 要连接的数据库名
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


app.get('/lastdata', (req, res) => {
    // 定义两个查询
    const query1 = influx.query('SELECT last(data) FROM "testdata"');
    const query2 = influx.query('SELECT last(state) FROM "testdata"');

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
                    const date = new Date(row.time);
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
                return {
                    time: result.time,
                    data: result.data,
                    tag: result.tag     };
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

