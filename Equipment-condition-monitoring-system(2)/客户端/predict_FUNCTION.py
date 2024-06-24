import socket
from keras.models import load_model
import numpy as np
import pandas as pd
import io
import time
np.set_printoptions(precision=4, suppress=True)



# 显示较大的数组时不截断
np.set_printoptions(threshold=10000)
model = load_model("D:\\my_wd_cnn_model.h5")
# 设置服务器地址和端口号
SERVER_ADDRESS = 'localhost'  # 若服务器在同一台机器上，使用'localhost'；若远程服务器，请填写其IP地址
SERVER_PORT = 55000
# 创建一个套接字
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# 连接到服务器
client_socket.connect((SERVER_ADDRESS, SERVER_PORT))

# 设置超时时间为5秒
#client_socket.settimeout(30)

dd=""

while True:
     #time.sleep(8)
     received_data = ''  # 初始接收的数据为空字节串

     while True:
          response = client_socket.recv(2048*200).decode()
          received_data += response
          print(1)
          if not response:  # 如果没有更多数据
               break

           # 假设收到了数据结束标志，例如'\r\n\r\n'
          if '#' in response:
               break

         

     
     #print(response)  
     # 如果数据是CSV格式的，你可以使用io.StringIO来创建一个文件对象，然后使用pandas的read_csv函数来读取它  
     data_io = io.StringIO(received_data[1:-1])
     df = pd.read_csv(data_io, header=None)
     df=df.apply(pd.to_numeric, errors='coerce')
     print(df.size)
     if df.size >= 2048:
          df[2047]=0
          df=df.values.reshape(1, 2048, 1)

          pre=model.predict(df)
          predicted_classes = np.argmax(pre, axis=1)
          print(predicted_classes)
          client_socket.sendall(("001"+str(predicted_classes)+'\n').encode())
     else:
          print("Warning: DataFrame length is less than 2048, operation not executed.")
          

     
# 如果需要持续通信，可以将上述发送和接收放在循环中

# 关闭套接字
client_socket.close()