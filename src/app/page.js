'use client'
import Link from 'next/link';

const App = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col gap-4 justify-center items-center">
                <Link href="/host">
                    <button className="bg-blue-500 text-white p-4 rounded w-64">Host</button>
                </Link>
                <Link href="/main">
                    <button className="bg-blue-500 text-white p-4 rounded w-64">Join as Participant</button>
                </Link>
            </div>
        </div>
    );
};

export default App;