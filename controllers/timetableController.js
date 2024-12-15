const xlsx = require('xlsx');
const fs = require('fs').promises;
const TimetableModel = require('../models/timetableModel');

exports.uploadTimetable = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Không có file được tải lên');
        }

        // Đọc file Excel
        const workbook = xlsx.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const requiredFields = ['Tên Học Phần', 'Mã HP', 'Tiết Học','Ngày Bắt Đầu','Ngày Kết Thúc', 'Thứ', 'Giờ Bắt Đầu', 'Giờ Kết Thúc', 'Phòng Học'];

        // Xử lý dữ liệu từ Excel
        const data = xlsx.utils.sheet_to_json(worksheet)
        .filter(row =>
            requiredFields.every(field => row[field] && String(row[field]).trim() !== '')
        )
        .map(row => {
            const startTime = formatTime(row['Giờ Bắt Đầu']);
            const endTime = formatTime(row['Giờ Kết Thúc']);
            const studyDate = formatDate(row['Ngày Bắt Đầu']); // Chuyển đổi ngày học
            const studyDate2 = formatDate(row['Ngày Kết Thúc']); // Chuyển đổi ngày học
    
            console.log(`Ngày Bắt đầu (Excel): ${row['Ngày Bắt Đầu']} -> ${studyDate}`);
            console.log(`Ngày Kết Thúc (Excel): ${row['Ngày Kết Thúc']} -> ${studyDate}`);
            console.log(`Giờ bắt đầu: ${row['Giờ Bắt Đầu']} -> ${startTime}`);
            console.log(`Giờ kết thúc: ${row['Giờ Kết Thúc']} -> ${endTime}`);
    
            return {
                'Tên Học Phần': row['Tên Học Phần'].trim(),
                'Mã HP': row['Mã HP'].trim(),
                'Tiết Học': row['Tiết Học'].trim(),
                'Ngày Bắt Đầu': studyDate,
                'Ngày Kết Thúc': studyDate2,
                'Thứ': row['Thứ'],
                'Giờ Bắt Đầu': startTime,
                'Giờ Kết Thúc': endTime,
                'Phòng Học': row['Phòng Học'].trim(),
            };
        });
    


        console.log('Data sau khi làm sạch:', data);

        if (data.length === 0) {
            return res.status(400).send('Không có dữ liệu hợp lệ để import');
        }

        // Import dữ liệu vào database
        await TimetableModel.importClasses(data);

        // Xóa file sau khi import
        await fs.unlink(req.file.path);

        res.status(200).send('Import thành công');
    } catch (error) {
        console.error('Lỗi import:', error);
        res.status(500).send('Lỗi import dữ liệu');
    }
};

// Hàm định dạng thời gian
function formatTime(time) {
    if (!time) return null; // Nếu không có giá trị, trả về null

    // Nếu time là số, chuyển đổi từ định dạng Excel sang HH:mm:ss
    if (typeof time === 'number') {
        const totalSeconds = Math.round(time * 86400); // Số giây trong ngày
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // Định dạng lại thành chuỗi HH:mm:ss
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Nếu time là chuỗi, chuẩn hóa về HH:mm:ss
    if (typeof time === 'string') {
        const trimmedTime = time.trim();
        const date = new Date(`1970-01-01T${trimmedTime}`);
        return isNaN(date.getTime()) ? null : date.toTimeString().slice(0, 8);
    }

    return null; // Nếu không nhận diện được, trả về null
}

function formatDate(excelDate) {
    if (typeof excelDate !== 'number') return null;

    // Mốc thời gian: 1900-01-01
    const epoch = new Date(Date.UTC(1900, 0, 1));

    // Trừ đi 1 ngày nếu giá trị >= 60 để bù lỗi năm nhuận của Excel
    const days = excelDate - (excelDate >= 60 ? 2 : 1);

    // Thêm số ngày từ Excel vào mốc thời gian
    epoch.setDate(epoch.getDate() + days);

    // Trả về định dạng YYYY-MM-DD
    return epoch.toISOString().split('T')[0];
}



exports.getTimetable = async (req, res) => {
    try {
        const classes = await TimetableModel.getAllClasses();
        res.json(classes);
    } catch (error) {
        console.error('Lỗi truy vấn:', error);
        res.status(500).send('Lỗi truy vấn dữ liệu');
    }
};
