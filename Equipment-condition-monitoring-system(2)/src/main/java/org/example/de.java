package org.example;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class de {
    public static void main(String[] args) throws IOException {
        int port = 55000;
        ServerSocket serverSocket = new ServerSocket(port);
        System.out.println("服务器启动，监听端口 " + port);

        List<Socket> clients = new ArrayList<>(); // 保存所有客户端连接


        while (true) {
            Socket clientSocket = serverSocket.accept();
            System.out.println("客户端连接成功");
            clients.add(clientSocket); // 将新客户端添加到列表中


            new Thread(() -> {
                try (
                        BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                        PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true)
                ) {
                    String inputLine=" ";

                        while (true) {
                            detect dd = new detect();
                            List<File> files = dd.ListFiles();
                            if (files.size() > 0) {
                                for (File file : files) {
                                    List<Double> result = dd.get_data(file);
                                    System.out.println(result.size());
                                    String strResult = String.join(",", result.stream().map(Object::toString).toArray(String[]::new));
                                    System.out.println(strResult.length());
                                    strResult+="#";
                                    Thread.sleep(1000);
                                    out.println(strResult);


                                    inputLine = in.readLine();

                                    //Thread.sleep(1000);

                                    System.out.println("客户端数:" + clients.size() + " 收到客户端消息: " + inputLine);
                                    //int read = System.in.read();
                                    dd.out_xls(inputLine, file);
                                    dd.rename(file);
                                    result.clear();

                                }
                            } else {
                                Thread.sleep(1000);
                                System.out.println("文件列表为空");
                            }
                        }



                } catch (IOException e) {
                    e.printStackTrace();
                    clients.remove(clientSocket); // 如果连接关闭，从列表中移除
                }
                catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }).start();
    }
}}
