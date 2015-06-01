
// ACCOUNTS CONTROLLER
moneyleashapp.controller('TransactionController', function ($scope, $state, $rootScope, $stateParams, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseArray, AccountsFactory) {
   
    $scope.transactions = [];
    $scope.AccountTitle = '';
    $scope.inEditMode = false;
    $scope.uid = '';
    $scope.editIndex = '';
    $scope.currentItem = {
        'accountid': '',
        'type': '',
        'payee': '',
        'category': '',
        'amount': '',
        'date': '',
        'notes': '',
        'photo': ''
    };

    // EDIT / CREATE ACCOUNT
    if ($stateParams.transactionId === '-1') {
        $scope.currentItem = {
            'accountid': $stateParams.accountId
        }
        $scope.TransactionTitle = "Create Transaction";
    } else {
        // Edit account
        $scope.editIndex = $stateParams.transactionId;
        $scope.inEditMode = true;
        AccountsFactory.getTransaction($stateParams.accountId, $stateParams.transactionId).then(function (transaction) {
            var dtTransDate = new Date(transaction.date);
            if (isNaN(dtTransDate)) {
                dtTransDate = "";
            }
            $scope.currentItem = {
                'accountid': transaction.accountid,
                'type': transaction.type,
                'payee': transaction.payee,
                'category': transaction.category,
                'amount': transaction.amount,
                'date': dtTransDate,
                'notes': transaction.notes,
                'photo': transaction.photo
            };
        });
        $scope.TransactionTitle = "Edit Transaction";
    }

    // SAVE
    $scope.saveTransaction = function (currentItem) {
        if ($scope.inEditMode) {
            var transactionRef = AccountsFactory.getTransactionRef($stateParams.accountId, $stateParams.transactionId);
            var onComplete = function (error) {
                if (error) {
                    console.log('Synchronization failed');
                }
            };
            var dtTran = new Date($scope.currentItem.date);
            dtTran = +dtTran;
            $scope.currentItem.date = dtTran;
            transactionRef.update($scope.currentItem, onComplete);
            $scope.inEditMode = false;
        } else {
            // new 
            $scope.temp = {
                accountid: $stateParams.accountId,
                type: $scope.currentItem.type,
                payee: $scope.currentItem.payee,
                category: $scope.currentItem.category,
                amount: $scope.currentItem.amount,
                date: $scope.currentItem.date.getTime(),
                notes: $scope.currentItem.notes,
                photo: $scope.currentItem.photo
            };
            if (isNaN($scope.currentItem.notes)) {
                $scope.temp.notes = "";
            }
            if (isNaN($scope.currentItem.photo)) {
                $scope.temp.photo = "";
            }
            var sync = AccountsFactory.getTransactions($stateParams.accountId);
            sync.$add($scope.temp).then(function (newChildRef) {
                $scope.temp = {
                    accountid: newChildRef.key()
                };
            });
        }
        $rootScope.hide();
        $scope.currentItem = {};
        $state.go('app.transactionsByDay', { accountId: $stateParams.accountId, accountName: $stateParams.accountName });
    }
})