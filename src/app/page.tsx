import DarkVeil from '@/components/reactbits/DarkVeil';

export default function Page() {
  return (
    <div className="relative h-screen bg-black text-white">
      <DarkVeil />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-5xl font-bold">Vanguard</h1>
      </div>
    </div>
  );
}
