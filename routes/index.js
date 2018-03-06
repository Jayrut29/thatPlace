const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStores) );
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add',authController.isLoggedIn, storeController.addStore );
router.get('/stores/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/tags', catchErrors(storeController.getStoresByTags));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTags));

router.post('/add',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.createStore)
);

router.post('/add/:id',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.updateStore)
);
router.get('/stores/:id/edit',catchErrors(storeController.editStore));
router.get('/login',userController.loginForm);
router.get('/register',userController.registerForm);

router.post('/register', userController.validateRegister, userController.register, authController.login ); 

router.post('/login',authController.login);
router.get('/logout', authController.logout);

router.get('/account', userController.account);
router.post('/account', authController.isLoggedIn, userController.updateAccount);
router.post('/account/forgot', catchErrors(authController.forgot));

router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', authController.confirmPassword, catchErrors(authController.update));

router.get('/api/search', catchErrors(storeController.searchStores));
module.exports = router;
