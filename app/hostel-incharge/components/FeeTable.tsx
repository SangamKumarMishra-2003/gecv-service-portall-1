interface Fee {
  student: string;
  amount: number;
  paymentMode: string;
  paymentDate: string;
}

export default function FeeTable() {
  const fees: Fee[] = [
    {
      student: "Rahul Kumar",
      amount: 12000,
      paymentMode: "UPI",
      paymentDate: "2026-01-10",
    },
    {
      student: "Rahul Kumar",
      amount: 12000,
      paymentMode: "Cash",
      paymentDate: "2026-03-10",
    },
  ];

  return (
    <table>
      <thead>
        <tr>
          <th>Student</th>
          <th>Amount</th>
          <th>Payment Mode</th>
          <th>Payment Date</th>
        </tr>
      </thead>

      <tbody>
        {fees.map((fee, i) => (
          <tr key={i}>
            <td>{fee.student}</td>
            <td>{fee.amount}</td>
            <td>{fee.paymentMode}</td>
            <td>{fee.paymentDate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}