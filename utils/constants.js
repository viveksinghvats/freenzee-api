const productType = {
    FOOD: 'food',
    GROCERY: 'grocery'
}

const clockValue = {
    AM: 'AM',
    PM: 'PM'
}

module.exports = {
    productType,
    clockValue
}

class PriorityQueue {
    constructor() {
        this.queue = [];
    }

    convertArray() {
        if (this.isEmpty()) {
            return [];
        }
        let array = [];
        while (!this.isEmpty()) {
            array.push(this.pop());
        }
        return array;
    }

    push(date, value) {
        const element = { date, value };

        let low = 0;
        let high = this.queue.length;

        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (date < this.queue[mid].date) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        this.queue.splice(low, 0, element);
    }
    pop() {
        if (this.isEmpty()) {
            return null;
        }
        return this.queue.shift().value;
    }

    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.queue[0].value;
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    size() {
        return this.queue.length;
    }
}

module.exports.PriorityQueue = PriorityQueue;