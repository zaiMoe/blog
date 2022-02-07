#!/bin/bash
# 判断文件是否存在
read -p "filename: " filename
if [ -f $filename ]
then
 echo "yes"
 exit 0
else
 echo "no"
 exit 0
fi