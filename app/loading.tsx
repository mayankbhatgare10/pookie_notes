import Image from 'next/image';

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#f5f4e8] flex items-center justify-center">
            <div className="text-center">
                <div className="mb-8 flex justify-center">
                    <Image
                        src="https://z3759y9was.ufs.sh/f/SFmIfV4reUMk5188MmUlaGf9r1wvxu4RHXJ0FIpocWAU6bCY"
                        alt="Loading"
                        width={200}
                        height={200}
                        className="animate-bounce"
                        unoptimized
                    />
                </div>
                <h2 className="text-2xl font-bold text-black mb-2">Loading your pookies...</h2>
                <p className="text-[#a89968]">Just pretending to be productive, hold on!</p>
            </div>
        </div>
    );
}
