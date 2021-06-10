import React from 'react';
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import SideBar from '../../components/Sidebar';
import Header from '../../components/Header';
// import Home from '../home';
// import About from '../about';

import './index.global.scss';

interface Props {
  children?: JSX.Element[] | JSX.Element | React.ReactNode;
}

const Layout = (props: Props) => {
  const { children } = props;
  return (
    <section className="layout">
      <SideBar />
      <section className="container">
        <Header />
        <div>{children}</div>
      </section>
    </section>
  );
};

Layout.defaultProps = {
  children: null,
};

export default Layout;