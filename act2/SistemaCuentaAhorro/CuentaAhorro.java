public class CuentaAhorro {
    private double saldoAhorro;
    private static double tasaInteresAnual;

    public CuentaAhorro(double saldoInicial) {
        this.saldoAhorro = saldoInicial;
    }

    public void calcularInteresMensual() {
        double interesMensual = (saldoAhorro * tasaInteresAnual) / 12;
        saldoAhorro += interesMensual;
    }

    public static void modificaTasaInteres(double nuevaTasa) {
        tasaInteresAnual = nuevaTasa;
    }

    public double getSaldoAhorro() {
        return saldoAhorro;
    }

    public static double getTasaInteresAnual() {
        return tasaInteresAnual;
    }

    public void mostrarInformacion() {
        System.out.printf("Saldo actual: $%.2f\n", saldoAhorro);
        System.out.printf("Tasa de interés anual: %.1f%%\n", tasaInteresAnual * 100);
        System.out.println("------------------------");
    }
}
