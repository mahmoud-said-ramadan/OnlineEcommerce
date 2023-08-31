
export const createOrderMail = ({ userName, order, link } = {}) => {
    let couponExist = '';
    let htmlProducts = '';

    if (order?.coupon) {
        couponExist = `<tr>
                        <td colspan="3" class="total">subTotal:</td>
                        <td class="total">${order.subTotal}</td>
                    </tr>
                    <tr>
                        <td colspan="3" class="total">Coupon:${order.coupon}</td>
                        <td class="total"> -${order.discount}</td>
                    </tr>`
    }

    for (const product of order.products) {
        htmlProducts += `<tr>
                            <td style= "display: flex; align-items: center;">
                                <img style="display: inline-block;" src=${product.image.secure_url} alt="Product Image" class="product-image">
                                <div style="display: inline-block;">
                                    <h3 style="display: flex; align-items: center; margin-left: 5px;">${product.name}</h3>
                                </div>
                            </td>
                            <td>${product.quantity}</td>
                            <td>${product.unitPrice}</td>
                            <td>${product.totalPrice}</td>
                        </tr>`;
    }

    return `<!DOCTYPE html>
        <html>
        
        <head>
            <meta charset="UTF-8">
            <title>Order Confirmation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    padding: 20px;
                }
        
                h1 {
                    color: #333333;
                }
        
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                table #btn{
                    width: 100%;
                    margin-top: 20px;
                }

                th,
                td {
                    padding: 10px;
                    text-align: left;
                    border-bottom: 1px solid #dddddd;
                }
        
                th {
                    background-color: #f2f2f2;
                }
        
                .total {
                    font-weight: bold;
                }
        
                .product-image {
                    width: 80px;
                    height: 80px;
                    display: block;
                }
        
                .company-logo {
                    max-width: 150px;
                    margin-bottom: 20px;
                }

                .center {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

            </style>
        </head>
        
        <body>
            <h1>Order Confirmation</h1>
            <img src="../../white-logo-02.png" alt="Company Logo" class="company-logo">
            <p>Dear ${userName},</p>
            <p>Thank you for your order! We are pleased to confirm that your order has been received and is being processed.</p>
            <p>The shipment Code Is:<span style="background-color: #a8c7fa"> ${order.code}</span></p>
        
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Repeat the following section for each order item -->
                    ${htmlProducts}
                    <!-- End of repeated section -->
                </tbody>
                <tfoot>
                    ${couponExist}
                    <tr>
                        <td colspan="3" class="total">Total:</td>
                        <td class="total">${order.finalPrice}</td>
                    </tr>
                </tfoot>
            </table>

            <div style=" justify-content: center; display: flex;">
                    <a id="btn" href="${link}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Track The Shipment</a>
                </div>
        
            <p>If you have any questions or need further assistance, please don't hesitate to contact our customer support team.
            </p>
        
            <p>Thank you for choosing our services!</p>
            <p>Sincerely,</p>
            <p style="color:blue">The E-Commerce Team</p>
        </body>
        
        </html>`

}


// export const sendMail = async ({ from = process.env.EMAIL, to, subject, text, html, attachments = [] } = {}) => {
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: process.env.EMAIL,
//             pass: process.env.EMAIL_PASSWORD
//         },
//         tls: {
//             rejectUnauthorized: false
//         }
//     });

//     const info = await transporter.sendMail({
//         from: `"OnlineEcommers" <${from}>`, // sender address
//         to, // "mahmoudsaid.r22@gmail.com", // list of receivers
//         subject, // "Hello ✔", // Subject line
//         text,// "Hello world?", // plain text body
//         html,// "<b>Hello world?</b>", // html body
//         attachments
//     });
//     return true;
// }