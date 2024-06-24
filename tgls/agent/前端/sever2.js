// ���������ģ��
const express = require('express');
const Influx = require('influx');
const cors = require('cors');

// ���� Express Ӧ��
const app = express();
app.use(cors());

// ���� InfluxDB �ͻ���
const influx = new Influx.InfluxDB({
    host: 'localhost', // InfluxDB ��������ַ
    port: 8086,        // InfluxDB �˿�
    database: 'history', // Ҫ���ӵ����ݿ���
});

// �����ѯ���ݵ�·��
app.get('/orderdata', (req, res) => {
    // ��ȡ��ѯ��������ʼʱ��ͽ���ʱ��
    const starttime = req.query.starttime;
    const endtime = req.query.endtime;
    // const starttime = '2024-05-01T00:00:00';
    // const endtime = '2024-05-12T23:59:59';
    // ����Ƿ��ṩ�˿�ʼʱ��ͽ���ʱ�����
    if (!starttime || !endtime) {
        return res.status(400).json({ error: 'Missing starttime or endtime parameters' });
    }

    // ��ѯ���ݿ��ȡ����
    influx.query(`SELECT * FROM testdata WHERE time >= '${starttime}' AND time <= '${endtime}'`)
        .then(results => {
            // ��ȡ���е�����ֵ
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



// �����ѯ���ݵ�·��
app.get('/Alldata', (req, res) => {

    // ��ѯ���ݿ��ȡ����
    influx.query(`SELECT * FROM testdata`)
        .then(results => {
            // ��ȡ���е�����ֵ
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
// �����������������˿�
const port = 50000; // ����Ը�����Ҫ�޸Ķ˿ں�
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

