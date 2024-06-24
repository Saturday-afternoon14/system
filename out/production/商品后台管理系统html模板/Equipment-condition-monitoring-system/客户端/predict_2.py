# coding = utf-8
import socket
from keras.models import load_model
import numpy as np
import pandas as pd
import io
import time
np.set_printoptions(precision=4, suppress=True)
import os
current_directory = os.getcwd()


# ��ʾ�ϴ������ʱ���ض�
np.set_printoptions(threshold=10000)
model = load_model('D:\\my_wd_cnn_model.h5')
# ���÷�������ַ�Ͷ˿ں�
SERVER_ADDRESS = 'localhost'  # ���������ͬһ̨�����ϣ�ʹ��'localhost'����Զ�̷�����������д��IP��ַ
SERVER_PORT = 60000
# ����һ���׽���
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# ���ӵ�������
client_socket.connect((SERVER_ADDRESS, SERVER_PORT))



while True:
     time.sleep(4)
     response = client_socket.recv(2048*200).decode()
     #print(response)  
     # ���������CSV��ʽ�ģ������ʹ��io.StringIO������һ���ļ�����Ȼ��ʹ��pandas��read_csv��������ȡ��  
     data_io = io.StringIO(response[1:])
     df = pd.read_csv(data_io, header=None)
     df=df.apply(pd.to_numeric, errors='coerce')
     df[2047]=0
     df=df.values.reshape(1, 2048, 1)

     pre=model.predict(df)
     predicted_classes = np.argmax(pre, axis=1)
     print(predicted_classes)
     client_socket.sendall(("002"+str(predicted_classes)+'\n').encode())

     
# �����Ҫ����ͨ�ţ����Խ��������ͺͽ��շ���ѭ����

# �ر��׽���
client_socket.close()