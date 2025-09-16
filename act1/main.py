from inversor import InversorNumero
from validador import ValidadorEntrada
if __name__ == "__main__":
    validador = ValidadorEntrada()
    num = validador.pedir_numero()  
    inversor = InversorNumero(num)
    print("Numero invertido:", inversor.invertir())
