describe('Blog app', function () {
  beforeEach(function() {
    cy.request('POST', `${Cypress.env('BACKEND')}/testing/reset`)
    const user = {
      name: 'Supertester',
      username: 'root',
      password: 'secret'
    }
    cy.request('POST', `${Cypress.env('BACKEND')}/users`, user)
    cy.visit('')
  })

  it('Login from is shown', function() {
    cy.get('#loginForm')
  })

  describe('Login', function() {
    it('succeeds with corect credentials', function() {
      cy.get('#username').type('root')
      cy.get('#password').type('secret')
      cy.get('#login-button').click()

      cy.contains('Supertester logged in')
    })

    it('fails with wrong crefentials', function() {
      cy.get('#username').type('root')
      cy.get('#password').type('wrong')
      cy.get('#login-button').click()

      cy.contains('wrong username or password').should('have.css', 'background-color', 'rgb(211, 211, 211)')
    })
  })

  describe('When logged in', function() {
    beforeEach(function() {
      const user = {
        username: 'root',
        password: 'secret'
      }
      cy.login(user)
    })

    it('A blog can be created', function() {
      cy.contains('create a new Blog').click()
      cy.get('input[placeholder="write blog title here"]').type('React it is a great library')
      cy.get('input[placeholder="write blog auther name here"]').type('Author')
      cy.get('input[placeholder="write blog url addresse here"]').type('www.')
      cy.contains('send').click()

      cy.get('.blog').contains('React it is a great library Author')
    })

    describe('and a blog exists', function () {
      beforeEach(function () {
        cy.createBlog({
          title: 'React it is a great library',
          author: 'tester',
          url: 'www.'
        })
        cy.createBlog({
          title: 'Redux it is a great library',
          author: 'author',
          url: 'www.com'
        })
        cy.contains('React it is a great library').parent().parent().as('theBlogReact')
      })

      it('Users can like a blog', function() {
        cy.get('@theBlogReact').contains('view').click()
        cy.get('@theBlogReact').within(() => {
          cy.get('.buttonLike').click()
        })
        cy.get('@theBlogReact').contains('likes 1')
      })

      it('Users can delete own blog', function() {
        cy.get('@theBlogReact').contains('view').click()
        cy.get('@theBlogReact').contains('delete').click()
        cy.contains('React it is a great library').should('not.exist')
      })

      it('Only creator can see the delete button of the blog', function() {
        const user = {
          name: 'Other',
          username: 'other',
          password: 'secret'
        }
        cy.request('POST', `${Cypress.env('BACKEND')}/users`, user)
        cy.login({ username: 'other', password: 'secret' })
        cy.get('@theBlogReact').contains('view').click()
        cy.get('@theBlogReact').contains('delete').should('have.css', 'display', 'none')
      })

      it('the blogs are ordering ot likes', function () {
        cy.contains('Redux it is a great library').parent().parent().as('theBlogRedux')
        cy.get('@theBlogRedux').contains('view').click()
        cy.get('@theBlogRedux').within(() => {
          cy.get('.buttonLike').click()
        })
        cy.visit('')
        cy.get('.blog').eq(0).should('contain', 'Redux it is a great library')
        cy.get('.blog').eq(1).should('contain', 'React it is a great library')
      })
    })
  })
})