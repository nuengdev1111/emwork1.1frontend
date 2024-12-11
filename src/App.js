import React, { useEffect, useState } from 'react';
import { 
  getTransactions,
  getTransactionsByMonth,
  getMonthlyReport,
  deleteTransaction,
  updateTransaction
} from './services/api';

function App() {
  const [transactions, setTransactions] = useState(null);
  const [isEditingId, setIsEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', type: '', amount: '', transaction_date: '' });

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const [monthlyReport, setMonthlyReport] = useState(null);

  useEffect(() => {
    // เริ่มต้นแสดงทั้งหมดก่อน
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      const res = await getTransactions();
      setTransactions(res.data);
      setMonthlyReport(null); // ไม่มีสรุปถ้าไม่ได้เลือกเดือนปี
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }

  async function fetchByMonth() {
    if (!selectedYear || !selectedMonth) return;
    
    // แปลง year, month เป็นตัวเลข
    const yearNum = parseInt(selectedYear, 10);
    const monthNum = parseInt(selectedMonth, 10);
  
    try {
      const res = await getTransactionsByMonth(yearNum, monthNum);
      setTransactions(res.data);
  
      const reportRes = await getMonthlyReport(yearNum, monthNum);
      setMonthlyReport(reportRes.data);
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    }
  }
  

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  }

  const handleEdit = (transaction) => {
    setIsEditingId(transaction.id);
    setEditData({
      title: transaction.title,
      type: transaction.type,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date
    });
  }

  const handleUpdate = async (id) => {
    try {
      await updateTransaction(id, editData);
      const updatedTransactions = transactions.map(t => t.id === id ? {...t, ...editData} : t);
      setTransactions(updatedTransactions);
      setIsEditingId(null);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  }

  // ฟังก์ชันฟอร์แมตวันที่เป็น DD/MM/YYYY
  const formatDate = (dateStr) => {
    if(!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  const containerStyle = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    background: '#f0f0f0',
    minHeight: '100vh'
  };

  const titleStyle = {
    color: '#333',
    marginBottom: '20px'
  };

  const listStyle = {
    listStyleType: 'none',
    padding: 0
  };

  const listItemStyle = {
    background: '#fff',
    marginBottom: '10px',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 0 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const searchContainerStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>รายการทั้งหมด</h1>

      <div style={searchContainerStyle}>
        <input 
          type="number" 
          placeholder="ปี (เช่น 2024)" 
          value={selectedYear} 
          onChange={e => setSelectedYear(e.target.value)}
        />
        <input 
          type="number" 
          placeholder="เดือน (1-12)" 
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        />
        <button onClick={fetchByMonth}>ค้นหาตามเดือน</button>
        <button onClick={fetchAllData}>แสดงทั้งหมด</button>
      </div>

      {/* แสดงรายงานประจำเดือน ถ้ามี */}
      {monthlyReport && (
        <div style={{marginBottom: '20px'}}>
          <h3>รายงานประจำเดือน {selectedMonth}/{selectedYear}</h3>
          <p>รายรับรวม: {monthlyReport.totalIncome}</p>
          <p>รายจ่ายรวม: {monthlyReport.totalExpense}</p>
          <p>ยอดคงเหลือ: {monthlyReport.balance}</p>
        </div>
      )}

      {/* หากมีการเลือกเดือนและปีจะแสดงหัวข้อว่ากำลังดูรายการของเดือนนั้น */}
      {selectedMonth && selectedYear && (
        <h2 style={{marginBottom: '20px'}}>รายการประจำเดือน {selectedMonth}/{selectedYear}</h2>
      )}

      {!transactions ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <ul style={listStyle}>
          {transactions.map(t => (
            <li key={t.id} style={listItemStyle}>
              {isEditingId === t.id ? (
                <div style={{flex: 1, marginRight: '10px'}}>
                  <input 
                    type="text" 
                    placeholder="ชื่อรายการ" 
                    value={editData.title} 
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    style={{marginRight: '5px'}}
                  />
                  <select 
                    value={editData.type} 
                    onChange={(e) => setEditData({...editData, type: e.target.value})}
                    style={{marginRight: '5px'}}
                  >
                    <option value="income">income</option>
                    <option value="expense">expense</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="จำนวนเงิน" 
                    step="0.01"
                    value={editData.amount} 
                    onChange={(e) => setEditData({...editData, amount: e.target.value})}
                    style={{marginRight: '5px'}}
                  />
                  <input 
                    type="date" 
                    value={editData.transaction_date} 
                    onChange={(e) => setEditData({...editData, transaction_date: e.target.value})}
                    style={{marginRight: '5px'}}
                  />
                  <button onClick={() => handleUpdate(t.id)}>บันทึก</button>
                  <button onClick={() => setIsEditingId(null)}>ยกเลิก</button>
                </div>
              ) : (
                <>
                  <div style={{flex: 1}}>
                    <strong>{t.title}</strong> - {t.type} - {parseFloat(t.amount).toFixed(2)}  
                    <span style={{marginLeft: '10px', color: '#555'}}>
                      ({formatDate(t.transaction_date)})
                    </span>
                  </div>
                  <div>
                    <button onClick={() => handleEdit(t)} style={{marginRight: '5px'}}>แก้ไข</button>
                    <button onClick={() => handleDelete(t.id)}>ลบ</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
