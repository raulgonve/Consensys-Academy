// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Login Form
import loginHtml from '../content/login.html'

// Sites
import PosterPage from '../content/poster.html'
import HunterPage from '../content/hunter.html'
import SubmitionPage from '../content/new_submission.html'
import BountyPage from '../content/new_bounty.html'
import MyBountiesPage from '../content/my_bounties.html'

// Data
import dataUsers from '../data/users.json'
import listBounties from '../data/bounties.json'

// Import libraries we need.
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'
import { default as Web3 } from 'web3'
import { default as TruffleContract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
// quieres ver el ejemplo web? sip
import bountyDappArtifact from '../../build/contracts/BountyDapp.json'

// import { userInfo } from 'os'

// BountyDapp is our usable abstraction, which we'll use through the code below.
const BountyDapp = TruffleContract(bountyDappArtifact)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.

let accounts
let account
let BountyDappInstance

const App = {

  usuario : null,

  start: function () {
    const self = this

    // Is there an injected web3 instance?
    
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
    }
    web3 = new Web3(App.web3Provider)
    
    BountyDapp.setProvider(App.web3Provider)
    BountyDapp.web3.eth.defaultAccount = BountyDapp.web3.eth.accounts[0]

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
    
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
      account = accounts[0]
    })    
    self.viewLogin()
  },

  // New Functions

  NewBounty : function () {
    document.getElementById('container').innerHTML = BountyPage()
    
    var bountyForm = document.getElementById('form-new-bounty')
    bountyForm.addEventListener('submit', function (e) {
      if (e.preventDefault) e.preventDefault()
      
      var title = document.getElementById('inputTitle').value
      var description = document.getElementById('inputDescription').value
      var amount = document.getElementById('inputAmount').value
      
      BountyDapp.deployed().then(function (instance) {
        BountyDappInstance = instance
        // console.log(BountyDappInstance)
        BountyDappInstance.NewBounty(title, description, amount)
      })

      alert('Bounty Created ' + title)
      document.getElementById('container').innerHTML = PosterPage()
    })
  },

  BountiesList : function () {
    document.getElementById('container').innerHTML = HunterPage()

    let element = document.getElementById('BountiesTable')

    var listData = ''
    element.innerHTML = ''

    for (var i in listBounties) {
      var item = listBounties[i]
      listData += '<tr><td>' + item.title + '</td><td>' + item.description + '</td><td>' + item.amount + '</td><td><a class="btn text-white btn-success btn-inverse btn-sm" onclick="App.NewSubmissions(' + i + ')">Apply</a></td></tr>'
    }

    element.innerHTML = listData
  },

  NewSubmissions : function (i) {
    var item = listBounties[i]
    document.getElementById('container').innerHTML = SubmitionPage()
    document.getElementById('bounty-title').innerHTML = item.title
  },

  MyBounties : function () {
    document.getElementById('container').innerHTML = MyBountiesPage()

    let element = document.getElementById('MyBountiesTable')

    var listData = ''
    element.innerHTML = ''

    for (var i in listBounties) {
      var item = listBounties[i]
      listData += '<tr><td>' + item.title + '</td><td>' + item.description + '</td><td>' + item.amount + '</td><td><a class="btn text-white btn-success btn-inverse btn-sm" onclick="App.NewSubmissions(' + i + ')">Apply</a></td></tr>'
    }
    element.innerHTML = listData
  },

  Poster : function () {
    document.getElementById('container').innerHTML = PosterPage()
  },

  logout : function () {
    
    const self = this

    self.usuario = null

    var elem = document.querySelector('.logout')
    elem.remove()

    self.viewLogin()

  },

  viewLogin : function () {
    const self = this

    let el = document.getElementById('header')
    el.classList.add('mb-auto')
    document.getElementById('container').innerHTML = loginHtml()

    var loginForm = document.getElementById('form-login')

    // esta funcion captura el evento cuando el formulario es enviado, el boton hace el submit, este lo atrapa
    loginForm.addEventListener('submit', function (e) {
      // aqui evita que el formulario actualice la pagina, que es lo que hacen estos formularios por defecto
      if (e.preventDefault) e.preventDefault()
      var userLogged = null

      // aqui reviso linea por linea los usuarios que estan en el archivo userse.json, dataUsers esta caragado
      for (var j in dataUsers) {
        var ul = dataUsers[j]

        // COMPARO LA INFORMACION DE LOS DATOS DEL LOGIN
        if (ul.login === document.getElementById('inputUser').value && ul.pass === document.getElementById('inputPassword').value) {
          userLogged = ul
        }
      }

      if (userLogged != null) {
        self.usuario = userLogged

        document.getElementById('menu').innerHTML = '<a class="btn btn-default logout" onclick="App.logout()">Logout</a>'

        let header = document.getElementById('header').classList
        header.remove('mb-auto')
        header.add('mb-3')

        if (self.usuario.type === 'poster') { document.getElementById('container').innerHTML = PosterPage() }

        if (self.usuario.type === 'hunter') { self.BountiesList() }
      } else {
        document.getElementById('errAlert').innerHTML = '<div class="alert alert-danger" role="alert">Worng user or password!</div>'

        setTimeout(function () { document.getElementById('errAlert').innerHTML = '' }, 3000)
      }
      return false
    })
  }
}

window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      alert('Web3 correctly conected with the browser')
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      alert('Web3 conected using fallback manually')
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
  }

  App.start()
})
