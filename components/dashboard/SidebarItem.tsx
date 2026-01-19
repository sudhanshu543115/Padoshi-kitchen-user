export default function SidebarItem({ title, active }: { title: string; active: boolean }) {
    return (
        <div
            className={`px-4 py-2 rounded-lg cursor-pointer transition ${active
                ? "bg-blue-100 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
                }`}
        >
            {title}
        </div>
    );
}
