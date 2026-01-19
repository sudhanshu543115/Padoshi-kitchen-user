export default function TableRow({ id, name, status, amount }: { id: string; name: string; status: string; amount: string }) {
    const statusColor =
        status === "Delivered"
            ? "text-green-600"
            : status === "Pending"
                ? "text-yellow-600"
                : "text-red-600";

    return (
        <tr className="border-b last:border-none">
            <td className="py-2">{id}</td>
            <td>{name}</td>
            <td className={`font-medium ${statusColor}`}>{status}</td>
            <td>{amount}</td>
        </tr>
    );
}
