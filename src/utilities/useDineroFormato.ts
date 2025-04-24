export const formatoCLP = (numero: number): string =>{
    return numero.toLocaleString('es-CL');
}

export const formatoUSD = (monto: number): string =>{
    return monto.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}


