const { pool } = require('../config/database');

class TimetableModel {
    static async getAllClasses() {
        const [rows] = await pool.query('SELECT * FROM classes');
        return rows;
    }

    static async importClasses(classes) {
        // Xóa dữ liệu cũ
        await pool.query('DELETE FROM classes');
    
        // Chèn dữ liệu mới
        const query = 'INSERT INTO classes (ten_hoc_phan, ma_hoc_phan, tiet_hoc, ngay_hoc, gio_bat_dau, gio_ket_thuc, phong_hoc) VALUES ?';
        const values = classes
        .filter(row => row['Tên Học Phần'] && row['Mã HP'] && row['Tiết Học'] && row['Ngày Học'] && row['Giờ Bắt Đầu'] && row['Giờ Kết Thúc'] && row['Phòng Học'])
        .map(row => [
            row['Tên Học Phần'], 
            row['Mã HP'], 
            row['Tiết Học'], 
            row['Ngày Học'], 
            row['Giờ Bắt Đầu'], 
            row['Giờ Kết Thúc'], 
            row['Phòng Học']
        ]);
    
    console.log('Dữ liệu đã lọc để chèn vào database:', values);

    
        const [result] = await pool.query(query, [values]);
        return result;
    }
    
}

module.exports = TimetableModel;