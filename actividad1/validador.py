class ValidadorEntrada:
    def pedir_numero(self):
        while True:
            num = input("Digite un numero (0 a 99.999): ")
            if not num.isdigit():
                print("Solo se permiten valores numéricos enteros.")
                continue
            num_int = int(num)
            if num_int < 0 or num_int > 99999:
                print("El numero debe estar entre 0 y 99.999.")
                continue
            return num  