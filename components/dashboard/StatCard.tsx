export default function StatCard({ title, value }: { title: string; value: string }) {
    return (
        <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {value}
            </h3>
        </div>
    );
}
