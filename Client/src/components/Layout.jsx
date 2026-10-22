import React from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import Container from './Container';
import { useSelector } from 'react-redux';

function Layout() {
  const theme = useSelector((state) => state.theme.theme);

  return (
    <div className={theme}>
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;