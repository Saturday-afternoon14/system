package org.example;

import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;

import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;


public class detect {
    private static final int ROWS_PER_READ = 2048;
    private List<Double>result=new ArrayList<Double>();


    public List<File> ListFiles(){
        // 创建存储文件对象的列表
        List<File> fileObjects = new ArrayList<>();
        // 指定要遍历的文件夹路径
        String folderPath = "C:\\Users\\老八\\Desktop\\XMGLPro\\tgls\\agent\\前端\\uploads";

        // 创建一个 File 对象，表示文件夹路径
        File folder = new File(folderPath);

        // 获取文件夹中的文件列表
        File[] files = folder.listFiles();

        // 遍历文件列表并添加文件对象
        if (files != null) {
            for (File file : files) {
                if (file.isFile()&&file.getName().endsWith(".xls")) { // 判断是否为文件
                    if(!file.getName().contains("Y")) {
                        fileObjects.add(file);
                        System.out.println(file.getName());
                    }
                }
            }
        } else {
            System.out.println("指定的路径不是一个文件夹或者文件夹为空.");
            return fileObjects;
        }
        return fileObjects;
    }


    public List<Double> get_data(File file){

        // 列索引（从0开始）
        int columnIndex = 0;
        try {
            FileInputStream inputStream = new FileInputStream(file);
            Workbook workbook = WorkbookFactory.create(inputStream);

            // 获取第一个工作表（如果有多个工作表，可以通过workbook.getSheetAt(index)获取）
            Sheet sheet = workbook.getSheetAt(0); // 假设从第一个工作表读取

            // 遍历行并提取指定列的数据
            for (int rowNum = 0; rowNum < ROWS_PER_READ; rowNum++) {
                Row row = sheet.getRow(rowNum);
                if (row != null) {
                    Cell cell = row.getCell(columnIndex);
                    if (cell != null) {
                        // 假设数据是double类型，如果不是，需要相应转换
                        double value = cell.getNumericCellValue();
                        result.add(value);
                    }
                }
            }
            workbook.close();
            inputStream.close();

            // 读取完成后，修改文件名为新的文件名
//            String originalFilePath = file.getAbsolutePath();
//            String newFilePath = originalFilePath.replace(".xlsx", "#.xlsx"); // 新文件名规则，可以根据需求调整
//            File newFile = new File(newFilePath);

        } catch (IOException | EncryptedDocumentException ex) {
            ex.printStackTrace();
        }



        return result;
    }

    public void rename(File file){
        String parentDirectory = file.getParent();
        String fileName = file.getName();

        // 构造新文件名，在文件名头部加上 #
        String newFileName = "Y" + fileName;
        // 构造新文件的完整路径
        String newFilePath = parentDirectory + File.separator + newFileName;
        // 创建新的 File 对象
        File newFile = new File(newFilePath);

        if (file.renameTo(newFile)) {
            System.out.println("文件重命名成功！");
        } else {
            System.out.println("文件重命名失败！");
        }
    }


    public void out_xls(String out,File file){


        try (FileInputStream fis = new FileInputStream(file)) {
            // 打开Excel文件
            Workbook workbook = WorkbookFactory.create(fis);

            // 获取第一个sheet
            Sheet sheet = workbook.getSheetAt(0);

            // 在第一行创建一个单元格并插入 #
            Row firstRow = sheet.getRow(0);
            if (firstRow == null) {
                firstRow = sheet.createRow(0);
            }
            Cell cell = firstRow.createCell(0);
            cell.setCellValue(out);

            // 写回到Excel文件
            try (FileOutputStream fos = new FileOutputStream(file)) {
                workbook.write(fos);
            }

            System.out.println("成功");

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
