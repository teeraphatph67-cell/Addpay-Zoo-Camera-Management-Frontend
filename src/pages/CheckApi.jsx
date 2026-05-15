import { useState } from "react";

export default function CompareZooId() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const API1 = "http://localhost/lumen-api/public/api/v1/Getcamera";
  const API2 = "https://addpay.net/api/v1/zoo/e-member/all-zoo";

  async function handleCompare() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const [res1, res2] = await Promise.all([fetch(API1), fetch(API2)]);
      const data1 = await res1.json();
      const data2 = await res2.json();

      // ดึง zoo_id จาก API1
      const list1 = (Array.isArray(data1.data) ? data1.data : data1)
        .map(item => item.zoo_id)
        .filter(id => id != null);

      // ดึงข้อมูลจาก API2 (id และ name)
      const list2 = (Array.isArray(data2.data) ? data2.data : data2)
        .map(item => ({ id: item.id, name: item.name }))
        .filter(item => item.id != null);

      const ids2 = list2.map(item => item.id);

      // หาว่าตรงกันตัวไหน
      const matched = list2.filter(item => list1.includes(item.id));
      const onlyIn1 = list1.filter(id => !ids2.includes(id));
      const onlyIn2 = ids2.filter(id => !list1.includes(id));

      setResult({
        total1: list1.length,
        total2: list2.length,
        matched,
        onlyIn1,
        onlyIn2,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <h2>🧩 เปรียบเทียบ zoo_id (API1) กับ id (API2)</h2>
      <p>API1: {API1}</p>
      <p>API2: {API2}</p>

      <button
        onClick={handleCompare}
        disabled={loading}
        style={{
          background: "#4F46E5",
          color: "white",
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "กำลังโหลด..." : "เริ่มเช็ค zoo_id"}
      </button>

      {error && <p style={{ color: "red" }}>❌ Error: {error}</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>📊 ผลการเทียบ</h3>
          <p>API1 มี {result.total1} รายการ</p>
          <p>API2 มี {result.total2} รายการ</p>
          <p>✅ ตรงกัน {result.matched.length} รายการ</p>

          {result.matched.length > 0 && (
            <>
              <h4>🌿 รายการที่ตรงกัน</h4>
              <ul>
                {result.matched.map((item) => (
                  <li key={item.id}>
                    <strong>{item.id}</strong>: {item.name}
                  </li>
                ))}
              </ul>
            </>
          )}

          {result.onlyIn1.length > 0 && (
            <>
              <h4>❌ มีใน API1 แต่ไม่มีใน API2:</h4>
              <pre>{JSON.stringify(result.onlyIn1, null, 2)}</pre>
            </>
          )}

          {result.onlyIn2.length > 0 && (
            <>
              <h4>❌ มีใน API2 แต่ไม่มีใน API1:</h4>
              <pre>{JSON.stringify(result.onlyIn2, null, 2)}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
