export default [
  {
    path: '/',
    component: '../layouts/BlankLayout',
    routes: [
      {
        path: '/',
        redirect: '/plan',
      },
      {
        path: '/plan',
        component: '../layouts/MapLayout',
      },
      {
        path: '/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/login',
          },
        ],
      },
      {
        path: '/admin',
        component: '../layouts/SecurityLayout',
        routes: [
          {
            path: '/admin',
            component: '../layouts/BasicLayout',
            authority: ["platform_admin", "admin", "user"],
            routes: [
              {
                path: '/admin',
                redirect: '/admin/sats',
              },
              {
                name: 'list.sat-list',
                icon: 'user',
                path: '/admin/sats',
                authority: ['platform_admin', 'admin'],
                component: './SatList',
              },
              {
                component: './404',
              },
            ],
          },
          {
            component: './404',
          },
        ],
      },
    ],
  },
  {
    component: './404',
  },
];
