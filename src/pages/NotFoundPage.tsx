import Navigation from '../components/Navigation';

export default function NotFoundPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 pt-16">
        <div className="text-center">
          <h1 className="text-8xl font-bold text-gray-300 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">页面不存在</p>
          <p className="text-gray-400">您访问的页面可能已被移动或删除</p>
        </div>
      </div>
    </>
  );
}
