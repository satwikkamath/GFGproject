#include<iostream>
#include<vector>
#include<algorithm>
#include<set>

using namespace std;
int main()
{
        int n=9;
        int arr[n]={0 ,-4, -4, 0 ,-4 ,-4, -4 ,0, 0};
        set<int> s;
        for(int i=0;i<n;i++)
            s.insert(arr[i]);

        // cout<<s.size();
        if(s.size()==n)
            cout<<"true"<<endl;
        else
            cout<<"false"<<endl;
}