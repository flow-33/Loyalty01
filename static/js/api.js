const API = {
    userId:'user1',
    headers: {
        'Content-Type': 'application/json'
    },

     async post(endpoint, data) {
        console.log(`API POST ${endpoint}`, data);
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({ ...data, userId: this.userId })
            });
            
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.error || 'Request failed');
            }
            
            return responseData;
        } catch (error) {
            throw new Error(error.message || 'Failed to process request');
        }
    },

    async get(endpoint) {
        console.log(`API GET ${endpoint}`);
        const response = await fetch(`/api/${endpoint}`);
        const data = await response.json();
        console.log(`API GET ${endpoint} response:`, data);
        return data;
    },

    async loadHistory() {
        const response = await this.get(`user/${this.userId}`);
        if (response.history) {
            updateHistory(response.history);
        }
        return response;
    }
};