import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { Layout, Menu } from 'antd';
import { Route, Switch, Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined
} from '@ant-design/icons';

import { fetchAreaList } from './dashboard-base-actions.js';

import { logoutUser } from 'modules/login/login-action';
import ModuleRoutes from './module-routes.js';

import './dashboard-base.scss';
import userService from 'services/user-service.js';

const { Sider } = Layout;

function DashboardBase(props) {
  const [collapsed, setCollapsed] = useState(false);
  const history = useHistory();

  useEffect(() => {
    props.fetchAreaList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    setCollapsed(!collapsed);
  }

  function getRoutes(routes) {
    let setRoutes = routes.reduce((prev, prop) => {
      if (prop.path) {
        return [
          ...prev,
          <Route
            exact={prop.exact}
            path={prop.path}
            component={prop.component}
            key={prop.path}
          />
        ];
      } else if (prop.children) {
        return [...prev, ...getRoutes(prop.children)];
      } else {
        return prev;
      }
    }, []);
    return setRoutes;
  }

  const renderGrouped = groupedItem => {
    return (
      <Menu.ItemGroup key={groupedItem.label} title={groupedItem.label}>
        {renderRoutes(groupedItem.children)}
      </Menu.ItemGroup>
    );
  };

  const renderRoutes = routes => {
    const routesSorted = [...routes].sort((a, b) => {
      if (
        Object.hasOwnProperty.call(a, 'sidebarIndex') &&
        Object.hasOwnProperty.call(b, 'sidebarIndex')
      ) {
        return a.sidebarIndex - b.sidebarIndex;
      }
      return 0;
    });

    return routesSorted
      .filter(el => el.children || el.label)
      .map(el => {
        if (el.children && el.children.length > 0) {
          return renderGrouped(el);
        }
        return (
          <Menu.Item key={el.label}>
            <Link to={el.path}>
              <div className='d--f ai--c'>
                {el.icon && React.createElement(el.icon)}
                {el.label}
              </div>
            </Link>
          </Menu.Item>
        );
      });
  };

  const handleLogout = () => {
    history.push('/login');
    userService.logoutUser();
    props.logoutUser();
  };

  // todo: handle defaultSelectedKeys for different routes
  
  return (
    <Layout className='main-layout'>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme='light'
        className='custom-sider'
      >
        <div className='d--f fd--c full-height pb1'>
          <Link to='/'>
            <div className='logo'>
              {!collapsed && (
                <>
                  <span className='main'>COVID</span>
                  <span>.Control</span>
                </>
              )}
              {collapsed && <span className='main pad-sm'>COV</span>}
            </div>
          </Link>

          <Menu
            theme='light'
            mode='inline'
            defaultSelectedKeys={[ModuleRoutes[ModuleRoutes.length - 1].label]}
          >
            {renderRoutes(ModuleRoutes)}
          </Menu>
          <div className='sider-bottom-section'>
            <Menu theme='light' mode='inline'>
              <Menu.Item key='logout'>
                <div className='d--f ai--c' onClick={handleLogout}>
                  <LogoutOutlined />
                  Logout
                </div>
              </Menu.Item>
            </Menu>
          </div>
        </div>
      </Sider>
      <Layout className='site-layout'>
        {React.createElement(
          collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
          {
            className: 'trigger',
            onClick: toggle
          }
        )}
        <Switch>{getRoutes(ModuleRoutes)}</Switch>
      </Layout>
    </Layout>
  );
}

export default connect(null, {
  logoutUser,
  fetchAreaList
})(DashboardBase);
