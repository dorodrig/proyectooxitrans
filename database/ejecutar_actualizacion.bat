@echo off
REM Script para ejecutar actualizacion de base de datos
echo Ejecutando actualizacion de base de datos...
mysql -h database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com -u admin -poxitrans06092025* control_acceso_oxitrans -e "ALTER TABLE usuarios ADD COLUMN ubicacion_trabajo_latitud DECIMAL(10, 8), ADD COLUMN ubicacion_trabajo_longitud DECIMAL(11, 8), ADD COLUMN nombre_ubicacion_trabajo VARCHAR(200), ADD COLUMN descripcion_ubicacion_trabajo TEXT, ADD COLUMN tolerancia_ubicacion_metros INT DEFAULT 50;"
echo Agregando indices...
mysql -h database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com -u admin -poxitrans06092025* control_acceso_oxitrans -e "ALTER TABLE usuarios ADD INDEX idx_ubicacion_lat (ubicacion_trabajo_latitud), ADD INDEX idx_ubicacion_lng (ubicacion_trabajo_longitud);"
echo Actualizacion completada!
pause