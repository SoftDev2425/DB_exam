import { Request, Response, Router } from "express";
import { CustomRequest } from "../ICustomRequest";
import { redisClient } from "../../redis/client";

// take basket form redis and create order in db
// subtract from stock in both db and redis

// {
//   "message": "Basket updated",
//   "basket": {
//       "books": [
//           {
//               "isbn": "000613868-3",
//               "title": "Microcebus murinus",
//               "format": "Hardcover",
//               "language": "Dari",
//               "authors": [
//                   "Sallee Samweyes"
//               ],
//               "quantity": 0,
//               "price": 400,
//               "publisher": "Jabbersphere",
//               "thumbnailUrl": "http://dummyimage.com/185x100.png/5fa2dd/ffffff"
//           },
//           {
//               "isbn": "000493415-6",
//               "title": "Ardea golieth",
//               "format": "eBook",
//               "language": "Armenian",
//               "authors": [
//                   "Arlee Coo"
//               ],
//               "quantity": 0,
//               "price": 575,
//               "publisher": "Photobean",
//               "thumbnailUrl": "http://dummyimage.com/124x100.png/ff4444/ffffff"
//           }
//       ]
//   }
// }

// New Router instance
const orderRoutes = Router();

orderRoutes.get("/order", async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId;

    const userBasket = redisClient.get(`basket-${userId}`);

    if (!userBasket) {
      return res.status(404).json({ message: "Basket not found!" });
    }

    console.log(userBasket);

    return res.status(200).json({ message: "Orders route" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default orderRoutes;
