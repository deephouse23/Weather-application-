console.log('NotFound module loaded');

const NotFoundComponent = () => {
  console.log('NotFound component rendered');
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
};

console.log('NotFound type:', typeof NotFoundComponent);
export default NotFoundComponent; 