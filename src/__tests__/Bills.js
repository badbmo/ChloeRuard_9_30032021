/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import firebase from "../__mocks__/firebase";
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import Router from "../app/Router";
import Firestore from "../app/Firestore"

describe("Given I am connected as an employee", () => {
	describe("When I am on Bills Page", () => {
		test("Then bill icon in vertical layout should be highlighted", () => {
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
      }))
      Firestore.bills = () => ({ bills: [], get: jest.fn().mockResolvedValue() });
  
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['Bills'] } })
      document.body.innerHTML = `<div id='root'></div>`
      Router()
  
      expect(screen.queryByTestId('icon-window').classList.contains('active-icon')).toBeTruthy()
      });
		
    describe("When I click on the eye icon", () => {
      test("Then a modal should open", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const allBills = new Bills({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        $.fn.modal = jest.fn();
        // $.fn correspond à jquery.prototype .modal vient de bootstrap
        const eye = screen.getAllByTestId('icon-eye')[0]
        const handleClickIconEye = jest.fn(allBills.handleClickIconEye(eye))
        eye.addEventListener('click', handleClickIconEye)
        userEvent.click(eye)
        expect(handleClickIconEye).toHaveBeenCalled()

        const modale = document.getElementById('modaleFile')
        expect(modale).toBeTruthy()
      })
    })

    describe("When I click on the New Bill button", () => {
      test("Then I should be sent to NewBill page", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const allBills = new Bills({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const newBillButton = screen.getByTestId('btn-new-bill')
        const handleClickNewBill = jest.fn(allBills.handleClickNewBill())
        newBillButton.addEventListener('click', handleClickNewBill)
        userEvent.click(newBillButton)
        expect(handleClickNewBill).toHaveBeenCalled()

        const titleNewBill = screen.getAllByText('Envoyer une note de frais')
        expect(titleNewBill).toBeTruthy()
      })
    })


		test("Then bills should be ordered from earliest to latest", () => {
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;
			const dates = screen
				.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
				.map((a) => a.innerHTML);
			const antiChrono = (a, b) => (a < b ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);
			expect(dates).toEqual(datesSorted);
		});
	});
});

describe("Given I am connected as an employee", () => {
	describe("When I am on Bills Page and there is no bills", () => {
    test("Then there is no eye icon on the page", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = BillsUI({ data: []});
      document.body.innerHTML = html;
      const eye = document.querySelectorAll(`div[data-testid="icon-eye"]`)[0]
      expect(eye).toBeFalsy()
    });
  });
});


describe("When I am on Bills page but it is loading", () => {
	test("Then, Loading page should be rendered", () => {
		const html = BillsUI({ loading: true });
		document.body.innerHTML = html;
		expect(screen.getAllByText("Loading...")).toBeTruthy();
	});
});
describe("When I am on Bills page but back-end send an error message", () => {
	test("Then, Error page should be rendered", () => {
		const html = BillsUI({ error: "some error message" });
		document.body.innerHTML = html;
		expect(screen.getAllByText("Erreur")).toBeTruthy();
	});
});

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
	describe("When I navigate to Bills Page", () => {
		test("fetches bills from mock API GET", async () => {
			const getSpy = jest.spyOn(firebase, "get");
			const bills = await firebase.get();
			expect(getSpy).toHaveBeenCalledTimes(1);
			expect(bills.data.length).toBe(4);
		});
		test("fetches bills from an API and fails with 404 message error", async () => {
			firebase.get.mockImplementationOnce(() => Promise.reject(new Error("Erreur 404")));
			const html = BillsUI({ error: "Erreur 404" });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 404/);
			expect(message).toBeTruthy();
		});
		test("fetches messages from an API and fails with 500 message error", async () => {
			firebase.get.mockImplementationOnce(() => Promise.reject(new Error("Erreur 500")));
			const html = BillsUI({ error: "Erreur 500" });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 500/);
			expect(message).toBeTruthy();
		});
	});
});
