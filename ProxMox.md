- Testing
	- Disk and IO Performance
	- VM Performance
		- Version 9.1 for testing
		- Converted VM had biggest performance concerns
		- Caching in VM in ProxMox
			- default settings don't use this
		- Virtual IO so everything was converted to proxmox native
		- New VM Worked Nominally better
	- Conversion 
		- was extremely slow on an extremely small VM
		- NFS Share to VMDK
	- DRS
		- https://github.com/gyptazy/ProxLB
		- LXE Container
			- Shouldn't run as root
			- it can take it down as
	- Trouble simulating Load for embrace in lab
	- 
- Actions:
	- Mark send notes
	- Setup Test Environment
- https://support.citrix.com/external/article/CTX131239/supported-hypervisors-for-citrix-virtual.html
- https://slappeyco-my.sharepoint.com/:x:/g/personal/dub_carter_itvoice_com/IQAhntCvy_E9TpX20V0SYFMSAVn8iAd9Q-d4ZD7789XEDZ0?e=JkMfck&isSPOFile=1&ovuser=090f7937-61fd-44be-bca1-b2f2e772d7d1%2Cjoshua.jones%40itvoice.com&wdExp=TEAMS-TREATMENT&web=1&TeamsCID=bd109368-cdd8-4a42-a4d1-231cdb39db1c&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiI1MC8yNjA1MTQxNjcxMyJ9&linkOpenTime=1781292839930
	- Mark Wessler is doing most of this
	- HA and Citrix
	- Moses, Mark, Darrell, Mike, Adam


Croit Meeting
Ebels and Habitat have same dependency 10/11
SpecialTeleradiology HS7 waiting on RamSoft