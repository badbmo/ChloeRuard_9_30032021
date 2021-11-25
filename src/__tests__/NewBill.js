/**
 * @jest-environment jsdom
 */
import { fireEvent, screen } from "@testing-library/dom"
import '@testing-library/jest-dom'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import firebase from "../__mocks__/firebase.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import userEvent from "@testing-library/user-event"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    
    describe("When I upload a new file with a bad format", () => {
      test("Then it should display an error message", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = NewBillUI()
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestoreMock = {
          ref: jest.fn().mockReturnThis(),
          put: jest.fn().mockImplementation(() => Promise.resolve({ ref: {getDownloadURL: () => Promise.resolve()} })),
        };
        const firestore = {
          storage : firestoreMock
        }
        const newBill = new NewBill({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const errorMessage = document.querySelector(".error__image")
        const fileInput = screen.getByTestId("file")
        const newFile = new File([`test`], 'test.txt', {type: "texte/txt"})
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        fileInput.addEventListener('change', handleChangeFile)
        fireEvent.change(fileInput, {target: {files:[newFile],}})
        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.value).toBe("")
        expect(errorMessage.style.display).toBe("block")
        expect(firestoreMock.put).not.toHaveBeenCalled()
      })
    })

    describe("When I upload a new file with the right format", () => {
      test("Then the image should be in the file handler", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = NewBillUI()
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestoreMock = {
          ref: jest.fn().mockReturnThis(),
          put: jest.fn().mockImplementation(() => Promise.resolve({ ref: {getDownloadURL: () => Promise.resolve()} })),
        };
        const firestore = {
          storage : firestoreMock
        }
        const newBill = new NewBill({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const errorMessage = screen.getByTestId("error")
        const fileInput = screen.getByTestId("file")
        const newFile = new File(["(⌐□_□)"], "test.jpeg", {type: "image/jpeg"})
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        fileInput.addEventListener("change", handleChangeFile)
        fireEvent.change(fileInput, {target: {files: [newFile],},})
        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.files[0]).toStrictEqual(newFile)
        expect(firestoreMock.put).toHaveBeenCalled()
        expect(errorMessage.style.display).toBe("none")
      })
    })

    describe("When I submit a new bill with all the correct informations", () => {
      test("Then a new bill should be created and I should be sent to Bills Page", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = NewBillUI();
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const newBill = new NewBill({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const form = screen.getByTestId('form-new-bill')
        const handleSubmit = jest.fn(newBill.handleSubmit)
        form.addEventListener('submit', handleSubmit)
        fireEvent.submit(form)
        expect(handleSubmit).toHaveBeenCalled()

        const titleBills = screen.getAllByText('Mes notes de frais')
        expect(titleBills).toBeTruthy()

      })
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I submit a new bill on NewBill Page", () => {
    test("fetched bills from mock API POST should increase by 1", async () => {
       const postSpy = jest.spyOn(firebase, "post");
       const newBill = {
        id: 'Bufzho88JhduhYgsi7bd',
        name: "testPost",
        email: "a@a",
        type: "Services en ligne",
        vat: "60",
        pct: 10,
        amount: 100,
        status: "pending",
        date: "2021-11-13",
        commentary: "testPost",
        fileName: "testPost.png",
        fileUrl: "https://www.shutterstock.com/fr/image-photo/close-cropped-image-coffee-table-full-1390238210"
       };
       const bills = await firebase.post(newBill);
       expect(postSpy).toHaveBeenCalledTimes(1);
       expect(bills.data.length).toBe(5);
    })
    test("add bills to API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("add messages to API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})