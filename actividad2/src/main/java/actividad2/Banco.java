package actividad2;

import java.util.Scanner;

public class Banco {

    private Scanner scanner = new Scanner(System.in);

    // Método seguro para leer double (solo números)
    private double leerDouble(String mensaje) {
        double valor;
        while (true) {
            System.out.print(mensaje);
            String input = scanner.nextLine();

            // Validar que el input sea numérico (acepta decimales con .)
            if (input.matches("\\d+(\\.\\d+)?")) {
                valor = Double.parseDouble(input);
                break;
            } else {
                System.out.println("❌ Error: Solo se permiten números. Intente de nuevo.");
            }
        }
        return valor;
    }

    public void ejecutarSimulacion() {
        try {
            // Pedir saldos iniciales
            double saldo1 = leerDouble("Ingrese saldo inicial del Ahorrador 1: ");
            double saldo2 = leerDouble("Ingrese saldo inicial del Ahorrador 2: ");

            CuentaAhorro ahorrador1 = new CuentaAhorro(saldo1);
            CuentaAhorro ahorrador2 = new CuentaAhorro(saldo2);

            // Tasa 4%
            CuentaAhorro.modificaTasaInteres(0.04);
            ahorrador1.calculaInteresMensual();
            ahorrador2.calculaInteresMensual();

            System.out.println("\nCon tasa 4%:");
            System.out.printf("Saldo Ahorrador 1: %.2f%n", ahorrador1.getSaldoAhorro());
            System.out.printf("Saldo Ahorrador 2: %.2f%n", ahorrador2.getSaldoAhorro());

            // Tasa 5%
            CuentaAhorro.modificaTasaInteres(0.05);
            ahorrador1.calculaInteresMensual();
            ahorrador2.calculaInteresMensual();

            System.out.println("\nCon tasa 5%:");
            System.out.printf("Saldo Ahorrador 1: %.2f%n", ahorrador1.getSaldoAhorro());
            System.out.printf("Saldo Ahorrador 2: %.2f%n", ahorrador2.getSaldoAhorro());

        } catch (IllegalArgumentException e) {
            System.out.println("❌ Error: " + e.getMessage());
        }
    }
}
